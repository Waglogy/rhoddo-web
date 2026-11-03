'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { formatDate, formatINR } from '@/lib/format';
import { markOrganizerPhoneVerified, setOrganizerCredit, setOrganizerStatus } from '@/actions/adminHosts';
import { recordFeePayment, undoFeePayment, type FeePaymentResult } from '@/actions/hostFeePayments';
import type { OrganizerRow } from './types';

export type { OrganizerRow };

type Filter = 'all' | 'pending' | 'approved' | 'suspended';

function StatusPill({ status }: { status: OrganizerRow['status'] }) {
  const map = {
    approved: 'border-pine/60 text-pine bg-pine/10',
    pending: 'border-gold/60 text-gold bg-gold/10',
    suspended: 'border-primary/60 text-primary bg-primary/10',
  } as const;
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${map[status]}`}
    >
      {status}
    </span>
  );
}

export function HostsClient({ organizers }: { organizers: OrganizerRow[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const rows = useMemo(() => {
    if (filter === 'all') return organizers;
    return organizers.filter((o) => o.status === filter);
  }, [organizers, filter]);

  function runAction(fn: () => Promise<void>) {
    setErr(null);
    startTransition(() => {
      fn().catch((e) => setErr(e instanceof Error ? e.message : 'Something went wrong'));
    });
  }

  return (
    <div>
      {err && (
        <div className="mb-6 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-ink">
          {err}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'suspended'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-xl border px-4 py-2 text-xs uppercase tracking-wider transition ${
              filter === f
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-line text-mute hover:border-ink hover:text-ink'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div className="card mt-6 divide-y divide-line">
        {rows.length === 0 && (
          <div className="p-6 text-sm text-mute">No hosts match this filter.</div>
        )}
        {rows.map((o) => (
          <OrganizerCard
            key={o.id}
            o={o}
            disabled={pending}
            onApprove={() => runAction(() => setOrganizerStatus(o.id, 'approved'))}
            onSuspend={() => runAction(() => setOrganizerStatus(o.id, 'suspended'))}
            onPending={() => runAction(() => setOrganizerStatus(o.id, 'pending'))}
            onSaveCredit={(n) => runAction(() => setOrganizerCredit(o.id, n))}
            onMarkPhoneVerified={() => runAction(() => markOrganizerPhoneVerified(o.id))}
          />
        ))}
      </div>
    </div>
  );
}

function OrganizerCard({
  o,
  disabled,
  onApprove,
  onSuspend,
  onPending,
  onSaveCredit,
  onMarkPhoneVerified,
}: {
  o: OrganizerRow;
  disabled: boolean;
  onApprove: () => void;
  onSuspend: () => void;
  onPending: () => void;
  onSaveCredit: (n: number) => void;
  onMarkPhoneVerified: () => void;
}) {
  const [credit, setCredit] = useState(String(o.freeTicketsRemaining));
  useEffect(() => {
    setCredit(String(o.freeTicketsRemaining));
  }, [o.freeTicketsRemaining]);

  return (
    <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-display text-lg text-ink">{o.businessName}</div>
          <StatusPill status={o.status} />
        </div>
        <div className="mt-1 text-sm text-mute">{o.name}</div>
        <div className="mt-0.5 text-xs text-mute">
          {o.email} · {o.phone ?? 'No phone'}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
              o.phoneVerified
                ? 'border-pine/60 bg-pine/10 text-pine'
                : 'border-gold/60 bg-gold/10 text-gold'
            }`}
          >
            {o.phoneVerified ? 'Phone verified' : 'Phone not verified'}
          </span>
          {!o.phoneVerified && o.phone && (
            <button
              type="button"
              disabled={disabled}
              onClick={onMarkPhoneVerified}
              className="text-xs text-mute underline hover:text-ink disabled:opacity-50"
            >
              I called them: mark verified
            </button>
          )}
        </div>
        <div className="mt-2 text-xs text-mute">
          Joined {formatDate(o.createdAt)}
          {o.approvedAt && (
            <>
              {' '}
              · Approved {formatDate(o.approvedAt)}
            </>
          )}
        </div>
        <div className="mt-2 text-xs text-mute">{o.venueCount} venue{o.venueCount !== 1 ? 's' : ''}</div>
        <div className="mt-2 text-xs text-mute">
          {o.ticketsSold} ticket{o.ticketsSold !== 1 ? 's' : ''} sold · Fees{' '}
          {formatINR(o.feesToDateINR)} · Paid {formatINR(o.paidINR)} ·{' '}
          <span className={o.dueINR > 0 ? 'text-gold' : ''}>Due {formatINR(o.dueINR)}</span>
        </div>
        <FeePayments o={o} />
      </div>

      <div className="flex flex-col gap-3 md:items-end">
        <div className="flex flex-wrap gap-2">
          {o.status === 'pending' && (
            <button
              type="button"
              disabled={disabled || !o.phoneVerified}
              title={o.phoneVerified ? undefined : 'Verify their phone number first'}
              onClick={onApprove}
              className="btn-primary text-xs disabled:opacity-50"
            >
              Approve
            </button>
          )}
          {o.status === 'approved' && (
            <button
              type="button"
              disabled={disabled}
              onClick={onSuspend}
              className="btn-danger text-xs disabled:opacity-50"
            >
              Suspend
            </button>
          )}
          {o.status === 'suspended' && (
            <>
              <button
                type="button"
                disabled={disabled || !o.phoneVerified}
                title={o.phoneVerified ? undefined : 'Verify their phone number first'}
                onClick={onApprove}
                className="btn-primary text-xs disabled:opacity-50"
              >
                Approve again
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={onPending}
                className="btn-ghost text-xs disabled:opacity-50"
              >
                Set pending
              </button>
            </>
          )}
          {o.status === 'pending' && (
            <button
              type="button"
              disabled={disabled}
              onClick={onSuspend}
              className="btn-ghost text-xs disabled:opacity-50"
            >
              Reject (suspend)
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 md:border-0 md:pt-0">
          <label className="text-[10px] uppercase tracking-wider text-mute">Free-ticket credit</label>
          <input
            className="input max-w-[100px] py-2 text-sm"
            type="number"
            min={0}
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
          />
          <button
            type="button"
            disabled={disabled}
            className="btn-ghost py-2 text-xs disabled:opacity-50"
            onClick={() => {
              const n = Number.parseInt(credit, 10);
              if (Number.isNaN(n) || n < 0) return;
              onSaveCredit(n);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function FeePayments({ o }: { o: OrganizerRow }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  function run(action: () => Promise<FeePaymentResult>, onDone?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) onDone?.();
      else setError(result.error);
    });
  }

  function record() {
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 1) {
      setError('Enter a whole rupee amount');
      return;
    }
    run(() => recordFeePayment(o.id, value, note), () => {
      setAmount('');
      setNote('');
    });
  }

  if (o.dueINR === 0 && o.recentFeePayments.length === 0) return null;

  return (
    <div className="mt-3 max-w-md">
      {o.dueINR > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={1}
            max={o.dueINR}
            className="input w-24 py-2 text-sm"
            placeholder="₹"
            aria-label={`Amount paid by ${o.businessName}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            className="input min-w-0 flex-1 py-2 text-sm"
            placeholder="Note, such as a UPI reference"
            maxLength={200}
            aria-label="Payment note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="button"
            disabled={busy || !amount}
            onClick={record}
            className="btn-ghost py-2 text-xs disabled:opacity-50"
          >
            Record payment
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-ink">{error}</p>}
      {o.recentFeePayments.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-mute">
          {o.recentFeePayments.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2">
              <span>
                {formatDate(p.paidAt)} · {formatINR(p.amountINR)}
                {p.note && ` · ${p.note}`}
              </span>
              <button
                type="button"
                disabled={busy}
                className="underline hover:text-ink disabled:opacity-50"
                onClick={() => {
                  if (window.confirm(`Undo this ${formatINR(p.amountINR)} payment?`)) {
                    run(() => undoFeePayment(p.id));
                  }
                }}
              >
                Undo
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

