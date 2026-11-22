'use client';

// Registration on rhoddo.com/r/<slug>: pick a pass, fill in the host's form, sign in
// with a code sent to their email, add a mobile number (not verified), then pay. Uses the same API as the app's checkout
// (rhoddo-app- app/checkout/[id].tsx), so bookings, tickets and the host's records are shared.

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/lib/format';
import { BuyerApiError, PLACEHOLDER_NAME, buyerApi, type Buyer } from '@/lib/buyerApi';
import { CheckoutClosed, openRazorpay } from '@/lib/razorpayWeb';
import {
  RegistrationFields,
  answerSetsNeeded,
  applicableAnswers,
  firstFormError,
  resizeAnswers,
  type EventForm,
  type FormAnswers,
} from './RegistrationFields';
import { eventWords } from '@/lib/eventWords';
import { SupportNote } from '@/components/SupportNote';
import { uploadPickedImages } from './formImages';

export type RegisterTier = {
  id: string;
  name: string;
  priceINR: number;
  perks: string[];
  left: number;
  /** Youngest age allowed on the event day. */
  minAge?: number | null;
};

export type RegisterEvent = {
  id: string;
  title: string;
  category?: string;
  tiers: RegisterTier[];
  form: EventForm | null;
  /** The event day, for age rules. */
  date?: string;
  termsText?: string;
  termsPdfUrl?: string | null;
  consentFormUrl?: string | null;
};

type Step = 'terms' | 'tickets' | 'details' | 'account' | 'pay';
type Booking = { id: string };
type Order = {
  orderId: string;
  amountPaise: number;
  currency: string;
  bookingId: string;
  keyId: string;
  hostName: string;
};
type Preview = { subtotal: number; discount: number; total: number; promoStatus: 'none' | 'applied' | 'invalid'; message?: string };

/** Most people one registration can cover. Same limit as the API and the app. */
const MAX_PER_REGISTRATION = 5;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The 10-digit Indian mobile number in what was typed, or null. Same rule as the API. */
function mobileDigits(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

export function RegisterPanel({
  event,
  initialUser,
  preferredTierId,
}: {
  event: RegisterEvent;
  initialUser: Buyer | null;
  /** A pass picked on the event page, selected when the popup opens. */
  preferredTierId?: string | null;
}) {
  const router = useRouter();
  const form = event.form;
  // The email is verified before the runner details, so every registration starts from a real inbox.
  // The event's own terms come first: nobody starts registering without accepting them.
  const hasTerms = Boolean(event.termsText?.trim() || event.termsPdfUrl);
  const steps: Step[] = [
    ...(hasTerms ? (['terms'] as const) : []),
    'tickets',
    'account',
    ...(form ? (['details'] as const) : []),
    'pay',
  ];

  const [step, setStep] = useState<Step>(steps[0]);
  const [acceptedEventTerms, setAcceptedEventTerms] = useState(false);
  const [tierId, setTierId] = useState(() => (event.tiers.find((t) => t.left > 0) ?? event.tiers[0])?.id);
  const [qty, setQty] = useState(1);
  const [answers, setAnswers] = useState<FormAnswers[]>([]);
  const [user, setUser] = useState<Buyer | null>(initialUser);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Account step. The email is verified with a code; the mobile number isn't.
  const [email, setEmail] = useState('');
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState(initialUser && initialUser.name !== PLACEHOLDER_NAME ? initialUser.name : '');
  const [phone, setPhone] = useState(initialUser?.phone?.replace(/^\+91/, '') ?? '');
  const [agreed, setAgreed] = useState(false);

  // Pay step
  const [promoInput, setPromoInput] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Each step starts at its top.
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    const t = preferredTierId && event.tiers.find((x) => x.id === preferredTierId && x.left > 0);
    if (t && (step === 'tickets' || step === 'terms')) {
      setTierId(t.id);
      setQty((q) => Math.max(1, Math.min(q, MAX_PER_REGISTRATION, t.left)));
    }
    // Only when a different pass is picked on the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredTierId]);

  const tier = event.tiers.find((t) => t.id === tierId) ?? event.tiers[0];
  if (!tier) {
    return <p className="text-sm text-mute">Registration isn&apos;t open for this event yet.</p>;
  }
  const maxQty = Math.max(1, Math.min(MAX_PER_REGISTRATION, tier.left));
  const soldOut = event.tiers.every((t) => t.left <= 0);
  const w = eventWords(event.category);
  const fullText = w.registration ? 'Registration full' : 'Sold out';
  const subtotal = tier.priceINR * qty;
  const total = preview?.total ?? subtotal;
  const needsName = !user || user.name === PLACEHOLDER_NAME || !user.name.trim();
  const needsTerms = !user?.termsAccepted;

  const go = (next: Step) => {
    setError(null);
    setStep(next);
  };
  const stepAfter = (s: Step) => steps[steps.indexOf(s) + 1];
  const stepBefore = (s: Step) => steps[steps.indexOf(s) - 1];

  const formAnswers = form ? resizeAnswers(answers, answerSetsNeeded(form, qty)) : undefined;

  function continueFromTickets() {
    if (tier.left <= 0) return setError(w.registration ? 'This pass is full. Choose another one.' : 'This pass is sold out. Choose another one.');
    // A changed pass or quantity changes the price, so any promo is checked again.
    setPreview(null);
    if (form) setAnswers((a) => resizeAnswers(a, answerSetsNeeded(form, qty)));
    go(stepAfter('tickets'));
  }

  const ageRules = { eventDate: event.date, minAge: tier.minAge, passName: tier.name };

  function continueFromTerms() {
    if (!acceptedEventTerms) return setError('Please read and accept the terms and conditions to continue');
    go('tickets');
  }

  function continueFromDetails() {
    const problem = form && formAnswers ? firstFormError(form, formAnswers, ageRules) : null;
    if (problem) return setError(problem);
    go('pay');
  }

  async function sendCode() {
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address');
    setBusy(true);
    setError(null);
    try {
      const res = await buyerApi<{ email: string }>('/api/buyer/email-otp/request', { body: { email: email.trim() } });
      setCodeSentTo(res.email);
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the code');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    if (!codeSentTo) return;
    setBusy(true);
    setError(null);
    try {
      const res = await buyerApi<{ user: Buyer }>('/api/buyer/email-otp/verify', { body: { email: codeSentTo, code } });
      setUser(res.user);
      if (res.user.name && res.user.name !== PLACEHOLDER_NAME) setName(res.user.name);
      if (res.user.phone && !phone) setPhone(res.user.phone.replace(/^\+91/, ''));
      setCodeSentTo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That code did not work');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await buyerApi('/api/buyer/logout', { body: {} }).catch(() => {});
    setUser(null);
    setName('');
    setPhone('');
    setPreview(null);
    router.refresh();
  }

  async function continueFromAccount() {
    if (!user) return;
    if (needsName && !name.trim()) return setError('Enter your name');
    if (!mobileDigits(phone)) return setError('Enter a valid 10-digit mobile number');
    if (needsTerms && !agreed) return setError('Please accept the Terms of Use and Privacy Policy');
    setBusy(true);
    setError(null);
    try {
      if (needsName) {
        const res = await buyerApi<{ user: Buyer }>('/me', { method: 'PATCH', body: { name: name.trim() } });
        setUser((u) => (u ? { ...u, name: res.user?.name ?? name.trim() } : u));
      }
      if (needsTerms) {
        await buyerApi('/me/accept-terms', { body: {} });
        setUser((u) => (u ? { ...u, termsAccepted: true } : u));
      }
      go(stepAfter('account'));
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  }

  async function applyPromo() {
    const promoCode = promoInput.trim();
    if (!promoCode) return;
    setBusy(true);
    setError(null);
    try {
      const res = await buyerApi<Preview>('/bookings/preview', {
        body: { eventId: event.id, tierId: tier.id, qty, promoCode },
      });
      if (res.promoStatus === 'applied') setPreview(res);
      else {
        setPreview(null);
        setError(res.message ?? 'This promo code is not valid');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  }

  /** Sends expired sign-ins and unaccepted terms back to the account step. */
  function handleError(err: unknown) {
    if (err instanceof BuyerApiError && err.status === 401) {
      setUser(null);
      setStep('account');
      setError('Please sign in again.');
      return;
    }
    if (err instanceof BuyerApiError && err.code === 'TERMS_REQUIRED') {
      setUser((u) => (u ? { ...u, termsAccepted: false } : u));
      setStep('account');
      setError('Please accept the Terms of Use and Privacy Policy');
      return;
    }
    setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
  }

  async function pay() {
    if (!user || busy) return;
    setBusy(true);
    setError(null);
    try {
      // Photos for Image questions are uploaded now that the buyer is signed in.
      // Answers to questions this person isn't asked (by age) are left out, so their files aren't uploaded.
      const savedAnswers =
        form && formAnswers && (await uploadPickedImages(applicableAnswers(form, formAnswers, event.date)));
      const input = {
        eventId: event.id,
        tierId: tier.id,
        qty,
        promoCode: preview?.promoStatus === 'applied' ? promoInput.trim() : undefined,
        ...(savedAnswers && { formAnswers: savedAnswers }),
        phone: `+91${mobileDigits(phone) ?? ''}`,
        ...(hasTerms && { acceptEventTerms: acceptedEventTerms }),
      };
      if (total <= 0) {
        const { booking } = await buyerApi<{ booking: Booking }>('/bookings', { body: input });
        router.push(`/ticket/${booking.id}`);
        return;
      }

      const { order } = await buyerApi<{ order: Order }>('/payments/create-order', { body: input });
      let paid;
      try {
        paid = await openRazorpay({
          key: order.keyId,
          amount: order.amountPaise,
          currency: order.currency,
          name: order.hostName,
          description: event.title,
          order_id: order.orderId,
          // Closes checkout before the seats' 15 minute hold runs out.
          timeout: 600,
          prefill: { name: user.name, email: user.email ?? '', contact: input.phone },
          theme: { color: '#C42A40' },
        });
      } catch (err) {
        // Frees the seats, unless the server finds they paid after all.
        const settled = await buyerApi<{ booking?: Booking }>(`/payments/${order.bookingId}/cancel`, { body: {} }).catch(
          () => undefined,
        );
        if (settled?.booking) {
          router.push(`/ticket/${settled.booking.id}`);
          return;
        }
        if (err instanceof CheckoutClosed && !err.failure) {
          setBusy(false);
          return;
        }
        throw new Error(
          `${err instanceof Error ? err.message : 'The payment did not go through.'} You have not been charged.`,
        );
      }

      try {
        const { booking } = await buyerApi<{ booking: Booking }>('/payments/verify', {
          body: {
            bookingId: order.bookingId,
            razorpayOrderId: paid.razorpay_order_id,
            razorpayPaymentId: paid.razorpay_payment_id,
            razorpaySignature: paid.razorpay_signature,
          },
        });
        router.push(`/ticket/${booking.id}`);
      } catch (err) {
        // No answer at all (lost connection): the server confirms with Razorpay by itself.
        if (err instanceof BuyerApiError && err.status !== 0) throw err;
        setNotice(
          'We received your payment. Your pass will reach your email within a few minutes.',
        );
      }
    } catch (err) {
      handleError(err);
      setBusy(false);
    }
  }

  if (notice) {
    return (
      <div className="p-5 sm:p-6">
        <div className="rounded-2xl border border-pine/30 bg-pine/10 p-5 text-sm text-ink">{notice}</div>
      </div>
    );
  }

  const stepIndex = steps.indexOf(step);
  const back = stepBefore(step);
  const STEP_NAMES: Record<Step, string> = {
    terms: 'Terms',
    tickets: 'Pass',
    account: 'Email',
    details: w.registration ? 'Runners' : 'Details',
    pay: total > 0 ? 'Pay' : 'Confirm',
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Progress */}
      <div className="border-b border-line px-5 pb-4 pt-1 sm:px-6">
        <ol className="flex gap-2" aria-label="Registration steps">
          {steps.map((s, i) => (
            <li key={s} className="min-w-0 flex-1" aria-current={i === stepIndex ? 'step' : undefined}>
              <div className={`h-1.5 rounded-full transition-colors ${i <= stepIndex ? 'bg-primary' : 'bg-line'}`} />
              <div className={`mt-1.5 truncate text-[11px] font-medium uppercase tracking-wider ${i === stepIndex ? 'text-ink' : 'text-mute'}`}>
                {i < stepIndex ? '✓ ' : ''}
                {STEP_NAMES[s]}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (busy) return;
          if (step === 'terms') continueFromTerms();
          else if (step === 'tickets') continueFromTickets();
          else if (step === 'details') continueFromDetails();
          else if (step === 'account') {
            if (!user) void (codeSentTo ? verifyCode() : sendCode());
            else void continueFromAccount();
          } else void pay();
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div ref={bodyRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        {step === 'terms' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl text-ink">Terms and conditions</h2>
              <p className="mt-1 text-sm text-mute">Please read the organiser&apos;s terms before you {w.registration ? 'register' : 'book'}.</p>
            </div>
            {event.termsText?.trim() && (
              <div
                tabIndex={0}
                aria-label="Terms and conditions"
                className="max-h-[45vh] overflow-y-auto whitespace-pre-line rounded-2xl border border-line bg-bg/60 p-4 text-sm leading-relaxed text-ink"
              >
                {event.termsText.trim()}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {event.termsPdfUrl && (
                <a href={event.termsPdfUrl} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-2 text-sm">
                  📄 Full terms (PDF)
                </a>
              )}
              {event.consentFormUrl && (
                <a href={event.consentFormUrl} target="_blank" rel="noreferrer" download className="btn-ghost inline-flex items-center gap-2 text-sm">
                  ⬇ Consent form (PDF)
                </a>
              )}
            </div>
            {event.consentFormUrl && (
              <p className="text-xs text-mute">
                Registering someone under 18? You&apos;ll need this form signed by their parent or guardian, and will
                upload it with their details.
              </p>
            )}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 text-sm text-ink">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[rgb(var(--primary))]"
                checked={acceptedEventTerms}
                onChange={(e) => {
                  setAcceptedEventTerms(e.target.checked);
                  setError(null);
                }}
              />
              <span>
                I have read and accept the terms and conditions of <span className="font-medium">{event.title}</span>
                {form?.perTicket ? ', for myself and everyone I register' : ''}.
              </span>
            </label>
          </div>
        )}

        {step === 'tickets' && (
          <>
            <div>
              <h2 className="font-display text-2xl text-ink">Choose your pass</h2>
              <div className="mt-4 space-y-2" role="radiogroup" aria-label="Pass">
                {event.tiers.map((t) => {
                  const selected = t.id === tier.id;
                  const out = t.left <= 0;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={out}
                      onClick={() => {
                        setTierId(t.id);
                        setQty((q) => Math.max(1, Math.min(q, MAX_PER_REGISTRATION, t.left)));
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        selected ? 'border-primary bg-primary/5' : 'border-line hover:border-ink/30'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? 'border-primary' : 'border-mute/60'
                        }`}
                      >
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink">{t.name}</span>
                        <span className="block text-xs text-mute">
                          {out
                            ? w.registration ? 'Full' : 'Sold out'
                            : [t.minAge ? `Ages ${t.minAge}+` : '', ...t.perks, t.left <= 20 ? `${t.left} left` : ''].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="font-display text-lg text-gold">{t.priceINR > 0 ? formatINR(t.priceINR) : 'Free'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-line p-4">
              <div>
                <div className="font-medium text-ink">How many?</div>
                <div className="text-xs text-mute">Up to {maxQty} in one {w.booking}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="One less"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-lg text-ink disabled:opacity-40"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                >
                  −
                </button>
                <span className="w-6 text-center font-display text-xl text-ink" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="One more"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-lg text-ink disabled:opacity-40"
                  onClick={() => setQty(Math.min(maxQty, qty + 1))}
                  disabled={qty >= maxQty}
                >
                  +
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'details' && form && formAnswers && (
          <RegistrationFields
            form={form}
            answers={formAnswers}
            onChange={(a) => {
              setAnswers(a);
              setError(null);
            }}
            disabled={busy}
            rules={ageRules}
            consentFormUrl={event.consentFormUrl}
          />
        )}

        {step === 'account' && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-2xl text-ink">Your contact</h2>
              <p className="mt-1 text-sm text-mute">We&apos;ll email your pass to this address.</p>
            </div>

            {!user && !codeSentTo && (
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                  Email
                </label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="mt-1 text-xs text-mute">We&apos;ll email you a 6-digit code to confirm it.</p>
              </div>
            )}

            {!user && codeSentTo && (
              <div>
                <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-ink">
                  Code sent to {codeSentTo}
                </label>
                <input
                  id="otp"
                  className="input tracking-[0.4em]"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="••••••"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                />
                <p className="mt-1 text-xs text-mute">Not there? Check your spam folder.</p>
                <div className="mt-2 flex gap-4 text-xs">
                  <button type="button" className="text-mute underline hover:text-ink" onClick={() => setCodeSentTo(null)}>
                    Change email
                  </button>
                  <button type="button" className="text-mute underline hover:text-ink" onClick={sendCode} disabled={busy}>
                    Send again
                  </button>
                </div>
              </div>
            )}

            {user && (
              <>
                <div className="flex items-center justify-between rounded-2xl border border-line px-4 py-3 text-sm">
                  <span className="text-ink">
                    Signed in as <span className="font-medium">{user.email ?? user.phone ?? user.name}</span>
                  </span>
                  <button type="button" className="text-mute underline hover:text-ink" onClick={signOut}>
                    Not you?
                  </button>
                </div>
                {needsName && (
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
                      Your name
                    </label>
                    <input
                      id="name"
                      className="input"
                      autoComplete="name"
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink">
                    Mobile number
                  </label>
                  <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-bg focus-within:border-primary">
                    <span className="flex items-center border-r border-line px-3 text-ink">+91</span>
                    <input
                      id="phone"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3 text-ink outline-none"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d\s+]/g, '').slice(0, 14))}
                    />
                  </div>
                  <p className="mt-1 text-xs text-mute">So the organiser can reach you about the event.</p>
                </div>
                {needsTerms && (
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-[rgb(var(--primary))]"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>
                      I agree to Rhoddo&apos;s{' '}
                      <a href="/terms" target="_blank" className="text-primary underline">
                        Terms of Use
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" target="_blank" className="text-primary underline">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                )}
              </>
            )}
          </div>
        )}

        {step === 'pay' && (
          <div className="space-y-5">
            <h2 className="font-display text-2xl text-ink">{total > 0 ? 'Review and pay' : 'Confirm'}</h2>
            {tier.priceINR > 0 && (
              <div>
                <label htmlFor="promo" className="mb-1.5 block text-sm font-medium text-ink">
                  Promo code
                </label>
                <div className="flex gap-2">
                  <input
                    id="promo"
                    className="input uppercase"
                    autoCapitalize="characters"
                    autoComplete="off"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPreview(null);
                    }}
                  />
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={applyPromo}
                    disabled={busy || !promoInput.trim() || preview?.promoStatus === 'applied'}
                  >
                    {preview?.promoStatus === 'applied' ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'pay' && (
        <div className="space-y-2 rounded-2xl border border-line bg-bg/60 p-4 text-sm">
          <div className="flex justify-between text-mute">
            <span>
              {tier.name} × {qty}
            </span>
            <span className="text-ink">{subtotal > 0 ? formatINR(subtotal) : 'Free'}</span>
          </div>
          {!!preview?.discount && (
            <div className="flex justify-between text-mute">
              <span>Promo discount</span>
              <span className="text-pine">− {formatINR(preview.discount)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between border-t border-line pt-2">
            <span className="font-medium text-ink">Total</span>
            <span className="font-display text-2xl text-ink">{total > 0 ? formatINR(total) : 'Free'}</span>
          </div>
          {total > 0 && (
            <p className="text-xs text-mute">{w.registration ? 'No extra fees.' : 'No booking fee.'} Pay by UPI, card or net banking, secured by Razorpay.</p>
          )}
        </div>
        )}
        <SupportNote context={`registering for ${event.title}`} />
        </div>

        {/* Footer: always visible */}
        <div className="space-y-3 border-t border-line bg-panel px-5 py-4 sm:px-6">
        {error && (
          <p role="alert" className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-ink">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          {back && (
            <button type="button" className="btn-ghost px-4 py-3.5" onClick={() => go(back)} disabled={busy} aria-label="Back">
              ←
            </button>
          )}
          <div className="min-w-0 shrink-0">
            <div className="text-[11px] uppercase tracking-wider text-mute">
              {qty} × {tier.name.length > 14 ? 'pass' : tier.name}
            </div>
            <div className="font-display text-xl leading-tight text-ink">{total > 0 ? formatINR(total) : 'Free'}</div>
          </div>
        <button type="submit" className="btn-primary flex-1 py-3.5 text-base" disabled={busy || soldOut || (step === 'terms' && !acceptedEventTerms)}>
          {soldOut
            ? fullText
            : busy
              ? 'Please wait…'
              : step === 'terms'
                ? 'Accept & continue'
              : step === 'account' && !user
                ? codeSentTo
                  ? 'Verify code'
                  : 'Send code'
                : step === 'pay'
                  ? total > 0
                    ? w.registration
                      ? `Pay ${formatINR(total)} & register`
                      : `Pay ${formatINR(total)}`
                    : w.registration
                      ? 'Complete registration'
                      : 'Get my pass'
                  : 'Continue'}
        </button>
        </div>
        </div>
      </form>
    </div>
  );
}
