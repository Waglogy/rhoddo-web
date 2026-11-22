'use client';

// Sign in or create an account: Google, or a 6-digit code sent by email (no password to
// remember). New accounts then add their name and accept the Terms. Same API and account
// as the app, so registrations made here also show in the app's Passes tab.

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { BuyerApiError, PLACEHOLDER_NAME, buyerApi, type Buyer } from '@/lib/buyerApi';

type GoogleId = {
  initialize: (o: { client_id: string; callback: (r: { credential?: string }) => void; ux_mode?: string }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInForm({ next, initialUser, googleClientId }: { next: string; initialUser: Buyer | null; googleClientId: string }) {
  const [user, setUser] = useState<Buyer | null>(initialUser);
  const [email, setEmail] = useState('');
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState(initialUser && initialUser.name !== PLACEHOLDER_NAME ? initialUser.name : '');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtn = useRef<HTMLDivElement>(null);

  const needsName = !!user && (!user.name?.trim() || user.name === PLACEHOLDER_NAME);
  const needsTerms = !!user && !user.termsAccepted;

  function finish(u: Buyer) {
    setUser(u);
    if (u.name && u.name !== PLACEHOLDER_NAME) setName(u.name);
    // A finished profile goes straight on; otherwise the profile step shows.
    if (u.termsAccepted && u.name && u.name !== PLACEHOLDER_NAME) window.location.assign(next);
  }

  // Google's button, once its script has loaded.
  useEffect(() => {
    if (!googleReady || user || !googleBtn.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async ({ credential }) => {
        if (!credential) return;
        setBusy(true);
        setError(null);
        try {
          const res = await buyerApi<{ user: Buyer }>('/api/buyer/google', { body: { idToken: credential } });
          finish(res.user);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Google sign-in failed');
        } finally {
          setBusy(false);
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtn.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      width: Math.min(googleBtn.current.offsetWidth || 360, 400),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleReady, user, googleClientId]);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
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

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!codeSentTo || code.length !== 6) return setError('Enter the 6-digit code');
    setBusy(true);
    setError(null);
    try {
      const res = await buyerApi<{ user: Buyer }>('/api/buyer/email-otp/verify', { body: { email: codeSentTo, code } });
      finish(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That code did not work');
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (needsName && !name.trim()) return setError('Enter your name');
    if (needsTerms && !agreed) return setError('Please accept the Terms of Use and Privacy Policy');
    setBusy(true);
    setError(null);
    try {
      if (needsName) await buyerApi('/me', { method: 'PATCH', body: { name: name.trim() } });
      if (needsTerms) await buyerApi('/me/accept-terms', { body: {} });
      window.location.assign(next);
    } catch (err) {
      if (err instanceof BuyerApiError && err.status === 401) {
        setUser(null);
        setError('Please sign in again.');
      } else {
        setError(err instanceof Error ? err.message : 'Could not save. Try again.');
      }
      setBusy(false);
    }
  }

  async function signOut() {
    await buyerApi('/api/buyer/logout', { body: {} }).catch(() => {});
    setUser(null);
    setCodeSentTo(null);
  }

  const errorBox = error && (
    <p role="alert" className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-ink">
      {error}
    </p>
  );

  // Step 2 for new accounts: name and terms.
  if (user) {
    return (
      <div className="card space-y-5 p-6 sm:p-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Almost done</h1>
          <p className="mt-1 text-sm text-mute">
            Signed in as <span className="font-medium text-ink">{user.email ?? user.phone ?? 'you'}</span>.{' '}
            <button type="button" className="underline hover:text-ink" onClick={signOut}>
              Not you?
            </button>
          </p>
        </div>
        <form onSubmit={saveProfile} className="space-y-5" noValidate>
          {needsName && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
                Your full name
              </label>
              <input
                id="name"
                className="input"
                autoComplete="name"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          )}
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
          {errorBox}
          <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={busy}>
            {busy ? 'Please wait…' : 'Continue'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card space-y-6 p-6 sm:p-8">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setGoogleReady(true)} />
      <div>
        <h1 className="font-display text-3xl text-ink">Sign in or create an account</h1>
        <p className="mt-1 text-sm text-mute">
          One Rhoddo account for the website and the app. Your registrations, payments and passes stay in one place.
        </p>
      </div>

      <div ref={googleBtn} className="flex min-h-[44px] w-full justify-center" aria-busy={!googleReady} />

      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-mute">
        <span className="h-px flex-1 bg-line" />
        or with your email
        <span className="h-px flex-1 bg-line" />
      </div>

      {!codeSentTo ? (
        <form onSubmit={sendCode} className="space-y-4" noValidate>
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
            <p className="mt-1 text-xs text-mute">We&apos;ll email you a 6-digit code. No password needed.</p>
          </div>
          {errorBox}
          <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={busy}>
            {busy ? 'Sending…' : 'Email me a code'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4" noValidate>
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
              <button type="button" className="text-mute underline hover:text-ink" onClick={() => sendCode()} disabled={busy}>
                Send again
              </button>
            </div>
          </div>
          {errorBox}
          <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={busy || code.length !== 6}>
            {busy ? 'Checking…' : 'Sign in'}
          </button>
        </form>
      )}
      <p className="text-center text-xs text-mute">New to Rhoddo? Signing in creates your account.</p>
    </div>
  );
}
