"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';

export default function HostRegisterPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/host/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, name, email, phone, password, acceptTerms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Registration failed');
      router.push('/host?welcome=1');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-16">
      <div className="absolute right-4 top-4 z-10"><ThemeToggle /></div>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-pine/25 blur-[140px]" />
        <div className="absolute right-[-120px] top-40 h-[420px] w-[420px] rounded-full bg-gold/12 blur-[140px]" />
      </div>

      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1fr_1.1fr]">
        {/* Pitch */}
        <div className="flex flex-col justify-center">
          <Link href="/" className="label">← Rhoddo</Link>
          <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
            List with Rhoddo.
            <br />
            <span className="text-gold">Keep more of every ticket.</span>
          </h1>
          <p className="mt-5 text-sm text-mute md:text-base">
            Marathons, trail runs, cycle races and tournaments, plus hands-on
            workshops. Take registrations, collect runner details with
            your own form, and scan passes at the start line, without the buyer fees
            that put people off signing up.
          </p>

          <div className="mt-8 space-y-4 text-sm">
            <Promise
              big="₹0"
              label="Buyer convenience fee"
              note="The price you set is the price they pay. Always."
            />
            <Promise
              big="5–10%"
              label="Rhoddo commission per booking"
              note="A small share of each sale, agreed when Rhoddo approves you and confirmed for each event."
            />
            <Promise
              big="Direct"
              label="Payments straight to you"
              note="Buyers pay into your own Razorpay account, so Rhoddo never holds your money."
            />
          </div>
        </div>

        {/* Form */}
        <div className="card p-8">
          <div className="label">Apply to host</div>
          <h2 className="mt-1 font-display text-2xl text-ink">Tell us about you</h2>
          <p className="mt-1 text-xs text-mute">
            After signing up, verify your phone number with a code. We&apos;ll then review
            your application within 2 working days. Once approved, you can add your venues
            and events, from races to workshops.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label mb-1 block">Business name</label>
              <input
                className="input"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Elgin Mount Pandim"
                required
              />
            </div>
            <div>
              <label className="label mb-1 block">Your name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pema Sherpa"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label mb-1 block">Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label mb-1 block">Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label mb-1 block">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <label className="flex items-start gap-3 text-sm text-ink">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#D1364B]"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
              />
              <span>
                I have read and accept the{' '}
                <Link href="/host-terms" target="_blank" className="text-gold underline-offset-2 hover:underline">
                  Rhoddo Host Terms
                </Link>{' '}
                and the{' '}
                <Link href="/privacy" target="_blank" className="text-gold underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {error && (
              <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-ink">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading || !acceptTerms}>
              {loading ? 'Creating account…' : 'Create host account'}
            </button>

            <p className="text-center text-xs text-mute">
              Already a host?{' '}
              <Link href="/host/login" className="text-gold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Promise({
  big,
  label,
  note,
}: {
  big: string;
  label: string;
  note: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-line bg-panel/50 p-4">
      <div className="font-display text-2xl text-gold leading-none w-20">{big}</div>
      <div className="flex-1">
        <div className="text-sm text-ink">{label}</div>
        <div className="mt-0.5 text-xs text-mute">{note}</div>
      </div>
    </div>
  );
}
