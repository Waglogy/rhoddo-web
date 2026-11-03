"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/client-api';
import { FieldLabel } from './FieldLabel';

export type HostPayments = {
  connected: boolean;
  keyId: string | null;
  mode: 'live' | 'test' | null;
  addedAt: string | null;
};

/** Where a host adds the Razorpay keys that buyers' payments go through. */
export function HostPaymentsCard({ payments }: { payments: HostPayments }) {
  const router = useRouter();
  const [editing, setEditing] = useState(!payments.connected);
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await clientApi('/organizer/payments/razorpay', {
        method: 'PUT',
        body: { keyId, keySecret },
      });
      setKeyId('');
      setKeySecret('');
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your keys');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('Remove your Razorpay keys? You will not be able to sell paid tickets.')) return;
    setBusy(true);
    setError(null);
    try {
      await clientApi('/organizer/payments/razorpay', { method: 'DELETE' });
      setEditing(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove your keys');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="payments" className="card mt-8 scroll-mt-8 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl text-ink">Payments</h2>
        {payments.connected ? (
          <span className="rounded-full border border-pine/60 bg-pine/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-pine">
            {payments.mode === 'live' ? 'Connected' : 'Test mode'}
          </span>
        ) : (
          <span className="rounded-full border border-gold/60 bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold">
            Not connected
          </span>
        )}
      </div>
      <p className="mt-2 max-w-2xl text-sm text-mute">
        Buyers pay directly into your own Razorpay account. Rhoddo never holds your money.
      </p>
      {payments.mode === 'test' && (
        <p className="mt-2 max-w-2xl text-sm text-gold">
          Test keys don&apos;t take real money. Add your live keys before selling real tickets.
        </p>
      )}

      {payments.connected && !editing && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="label">Key ID</div>
            <div className="mt-1 break-all font-mono text-sm text-ink">{payments.keyId}</div>
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-ghost" disabled={busy} onClick={() => setEditing(true)}>
              Change keys
            </button>
            <button type="button" className="btn-danger" disabled={busy} onClick={remove}>
              Remove
            </button>
          </div>
        </div>
      )}

      {editing && (
        <form onSubmit={save} className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel
              label="Key ID"
              info="Starts with rzp_live_ or rzp_test_. Find it in your Razorpay Dashboard under Account & Settings, then API Keys."
            />
            <input
              className="input"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              placeholder="rzp_live_…"
              autoComplete="off"
              spellCheck={false}
              required
            />
          </div>
          <div>
            <FieldLabel
              label="Key Secret"
              info="Razorpay shows this only once, when you generate your keys. We store it encrypted and never show it again, and our team can't see it in the panel."
            />
            <input
              className="input"
              type="password"
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Checking with Razorpay…' : 'Save keys'}
            </button>
            {payments.connected && (
              <button type="button" className="btn-ghost" disabled={busy} onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
