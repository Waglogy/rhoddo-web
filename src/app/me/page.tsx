'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

export default function DeleteAccount() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Step 2: the 6-digit code we emailed, proving the email is theirs.
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/me/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          codeSent
            ? { step: 'confirm', email: email.trim().toLowerCase(), code: code.trim() }
            : { step: 'request', email: email.trim().toLowerCase() },
        ),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      if (codeSent) setSubmitted(true);
      else setCodeSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="theme-site min-h-screen bg-bg text-ink">
      {/* NAV */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-auto sm:h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="text-sm text-mute transition hover:text-ink"
            >
              Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="label">Account</div>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
          Delete Your Account
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mute">
          We&apos;re sorry to see you go. Enter the email address of your Rhoddo
          account below. We&apos;ll email you a 6-digit code to confirm it&apos;s
          you, and your account is deleted as soon as you enter it.
        </p>

        {submitted ? (
          <div className="mt-12 rounded-xl border border-pine/40 bg-pine/10 p-8">
            <h2 className="font-display text-2xl text-ink">
              Account deleted
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              The Rhoddo account for <strong className="text-ink">{email}</strong> has been deleted,
              and you&apos;ve been signed out of the app on every device.
            </p>
            <Link href="/" className="btn-ghost mt-6 inline-block">
              Return to home
            </Link>
          </div>
        ) : (
          <>
            {/* What gets deleted */}
            <div className="mt-12">
              <h2 className="font-display text-xl text-ink">
                What happens when you delete your account
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-mute">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-primary">&#10005;</span>
                  <span>
                    Your profile information (name, email, phone number) will be
                    permanently deleted.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-primary">&#10005;</span>
                  <span>
                    All saved events and preferences will be removed.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-primary">&#10005;</span>
                  <span>
                    Your answers to registration forms and any photos you uploaded (such as ID cards)
                    will be deleted.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-primary">&#10005;</span>
                  <span>
                    Push notification tokens and notification history will be
                    deleted.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-mute">&#8226;</span>
                  <span>
                    Registrations you paid for stay with the event host as a paid place, with your
                    name and contact details removed, and payment records are kept for up to 3 years
                    for legal and accounting purposes, as described in our{' '}
                    <Link href="/privacy" className="text-gold hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </div>
              </div>
            </div>

            {/* Deletion request form */}
            <form onSubmit={handleSubmit} className="mt-12 max-w-lg">
              <h2 className="font-display text-xl text-ink">
                {codeSent ? 'Enter the code we emailed you' : 'Delete your account'}
              </h2>
              {codeSent && (
                <p className="mt-2 text-sm text-mute">
                  If <strong className="text-ink">{email}</strong> has a Rhoddo account, we&apos;ve sent it a
                  6-digit code. Enter it below to delete the account. Didn&apos;t get it? Check spam, or{' '}
                  <button type="button" className="text-gold hover:underline" onClick={() => { setCodeSent(false); setCode(''); }}>
                    try again
                  </button>
                  .
                </p>
              )}

              <label className="mt-6 block">
                <span className="text-xs uppercase tracking-wider text-mute">
                  Email address linked to your account
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input mt-2 w-full"
                  disabled={codeSent}
                />
              </label>

              {codeSent && (
                <label className="mt-5 block">
                  <span className="text-xs uppercase tracking-wider text-mute">6-digit code</span>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="input mt-2 w-full tracking-[0.4em]"
                    autoFocus
                  />
                </label>
              )}

              <label className="mt-5 block">
                <span className="text-xs uppercase tracking-wider text-mute">
                  Reason for leaving (optional)
                </span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Let us know how we can improve..."
                  className="input mt-2 w-full resize-none"
                />
              </label>

              <label className="mt-6 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-line bg-panel accent-primary"
                />
                <span className="text-sm text-mute">
                  I understand that this action is{' '}
                  <strong className="text-ink">permanent and irreversible</strong>.
                  My account and personal data will be deleted and cannot be recovered.
                </span>
              </label>

              {error && (
                <div className="mt-6 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!confirmed || !email || loading || (codeSent && code.length !== 6)}
                className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Please wait…' : codeSent ? 'Delete my account' : 'Email me a code'}
              </button>

              <p className="mt-4 text-xs text-mute">
                You can also request deletion from within the app under{' '}
                <strong className="text-ink">Profile &rarr; Delete account</strong>,
                or by emailing{' '}
                <a
                  href="mailto:support@rhoddo.com"
                  className="text-gold hover:underline"
                >
                  support@rhoddo.com
                </a>
                .
              </p>
            </form>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-mute">
              · Sikkim
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mute md:justify-start">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-ink">Refunds</Link>
            <Link href="/contact" className="hover:text-ink">Contact</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/" className="hover:text-ink">Home</Link>
          </div>
          <div className="text-center text-[11px] text-mute md:text-right">
            Built by <span className="text-gold">WAGLOGY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
