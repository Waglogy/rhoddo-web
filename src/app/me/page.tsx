'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DeleteAccount() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* NAV */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl text-ink">Rhoddo</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-mute">
              · Sikkim
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-mute transition hover:text-ink"
          >
            Back to home
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="label">Account</div>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
          Delete Your Account
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mute">
          We&apos;re sorry to see you go. If you&apos;d like to permanently
          delete your Rhoddo account and all associated data, please submit a
          request below.
        </p>

        {submitted ? (
          <div className="mt-12 rounded-xl border border-pine/40 bg-pine/10 p-8">
            <h2 className="font-display text-2xl text-ink">
              Request Received
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              We&apos;ve received your account deletion request for{' '}
              <strong className="text-ink">{email}</strong>. Our team will
              process your request within <strong className="text-ink">7 business days</strong>.
              You&apos;ll receive a confirmation email once your account and data
              have been permanently deleted.
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
                    Your booking history and QR passes will be deactivated.
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
                    Booking transaction records may be retained for up to 3 years
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
                Request Account Deletion
              </h2>

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
                />
              </label>

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
                  All my data will be deleted and cannot be recovered.
                </span>
              </label>

              {error && (
                <div className="mt-6 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!confirmed || !email || loading}
                className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Processing...' : 'Submit Deletion Request'}
              </button>

              <p className="mt-4 text-xs text-mute">
                You can also request deletion from within the app under{' '}
                <strong className="text-ink">Profile &rarr; Settings &rarr; Delete Account</strong>,
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
            <span className="font-display text-xl text-ink">Rhoddo</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-mute">
              · Sikkim
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mute md:justify-start">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
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
