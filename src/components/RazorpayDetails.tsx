'use client';

import { useState } from 'react';
import { formatINR } from '@/lib/format';

type Details = {
  id: string;
  status: string;
  method: string | null;
  amountINR: number;
  razorpayFeeINR: number | null;
  taxINR: number | null;
  upiId: string | null;
  bank: string | null;
  wallet: string | null;
  card: { network: string | null; last4: string | null; type: string | null; issuer: string | null } | null;
  reference: string | null;
  refundedINR: number;
  refundStatus: string | null;
  error: string | null;
};

const METHOD: Record<string, string> = { upi: 'UPI', card: 'Card', netbanking: 'Net banking', wallet: 'Wallet', emi: 'EMI', paylater: 'Pay later' };

/** Asks Razorpay (with the host's keys) how this payment was made. Nothing is stored. */
/** `area` is whose API to ask: 'admin' (any payment) or 'organizer' (the host's own). */
export function RazorpayDetails({ bookingId, area = 'admin' }: { bookingId: string; area?: 'admin' | 'organizer' }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [data, setData] = useState<Details | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setState('loading');
    try {
      const res = await fetch(`/api/backend/${area}/payments/${encodeURIComponent(bookingId)}/razorpay`);
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || `Failed (${res.status})`);
      setData(body.razorpay);
      setMessage(body.reason ?? null);
      setState('done');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not reach Razorpay');
      setState('error');
    }
  }

  if (state === 'idle' || state === 'loading') {
    return (
      <button type="button" className="text-xs text-primary hover:underline disabled:opacity-50" onClick={load} disabled={state === 'loading'}>
        {state === 'loading' ? 'Asking Razorpay…' : 'Payment method →'}
      </button>
    );
  }
  if (!data) return <p className="text-xs text-mute">{message}</p>;

  const how =
    data.method === 'upi'
      ? `UPI${data.upiId ? ` · ${data.upiId}` : ''}`
      : data.method === 'card' && data.card
        ? `${data.card.network ?? 'Card'} ${data.card.type ?? ''} ···· ${data.card.last4 ?? ''}${data.card.issuer ? ` · ${data.card.issuer}` : ''}`
        : data.method === 'netbanking'
          ? `Net banking${data.bank ? ` · ${data.bank}` : ''}`
          : data.method === 'wallet'
            ? `Wallet${data.wallet ? ` · ${data.wallet}` : ''}`
            : METHOD[data.method ?? ''] ?? data.method ?? '—';

  return (
    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 rounded-lg bg-bg px-3 py-2 text-xs">
      <dt className="text-mute">Method</dt>
      <dd className="text-ink">{how}</dd>
      <dt className="text-mute">Razorpay status</dt>
      <dd className="text-ink">{data.status}{data.refundStatus ? ` · refund ${data.refundStatus}` : ''}</dd>
      {data.reference && (
        <>
          <dt className="text-mute">Bank ref (RRN)</dt>
          <dd className="font-mono text-ink">{data.reference}</dd>
        </>
      )}
      {data.razorpayFeeINR != null && (
        <>
          <dt className="text-mute">Razorpay fee</dt>
          <dd className="text-ink">{formatINR(data.razorpayFeeINR)}{data.taxINR ? ` (incl. GST ${formatINR(data.taxINR)})` : ''}</dd>
        </>
      )}
      {data.refundedINR > 0 && (
        <>
          <dt className="text-mute">Refunded</dt>
          <dd className="text-ink">{formatINR(data.refundedINR)}</dd>
        </>
      )}
      {data.error && (
        <>
          <dt className="text-mute">Error</dt>
          <dd className="text-primary">{data.error}</dd>
        </>
      )}
    </dl>
  );
}
