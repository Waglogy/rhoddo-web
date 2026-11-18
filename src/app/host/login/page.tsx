"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';

export default function HostLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/host/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Login failed');
      router.push('/host');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="absolute right-4 top-4 z-10"><ThemeToggle /></div>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-pine/25 blur-[140px]" />
        <div className="absolute right-[-100px] bottom-10 h-[360px] w-[360px] rounded-full bg-gold/12 blur-[140px]" />
      </div>

      <div className="card w-full max-w-md p-8">
        <Link href="/" className="inline-block label">← Rhoddo</Link>
        <h1 className="mt-3 font-display text-3xl text-ink">Host sign in</h1>
        <p className="mt-1 text-sm text-mute">
          Manage your races, events, registrations and bookings.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
            <label className="label mb-1 block">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-ink">
              {error}
            </div>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-mute">
          New host?{' '}
          <Link href="/host/register" className="text-gold hover:underline">
            Apply to list with Rhoddo
          </Link>
        </p>
      </div>
    </div>
  );
}
