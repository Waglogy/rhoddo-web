'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/client-api';
import { formatINR } from '@/lib/format';

type Summary = {
  businessName: string;
  venues: number;
  events: number;
  upcomingEvents: number;
  bookings: number;
  upcomingTickets: number;
  checkoutsInProgress: number;
  feesDueINR: number;
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * Deleting a host can't be undone, so it takes two confirmations: first a summary of
 * everything that goes with them, then typing their business name.
 */
export function DeleteHostDialog({
  organizerId,
  businessName,
  onClose,
}: {
  organizerId: string;
  businessName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    clientApi<Summary>(`/admin/organizers/${organizerId}/deletion-summary`)
      .then(setSummary)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load this host'));
  }, [organizerId]);

  useEffect(() => {
    (step === 1 ? cancelRef : inputRef).current?.focus();
  }, [step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, onClose]);

  const nameMatches = typed.trim() === businessName.trim();

  async function remove() {
    if (!nameMatches) return;
    setBusy(true);
    setError(null);
    try {
      await clientApi(`/admin/organizers/${organizerId}`, { method: 'DELETE', body: { confirmName: typed } });
      onClose();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete this host');
      setBusy(false);
    }
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-host-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => !busy && onClose()}
    >
      <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-[10px] uppercase tracking-wider text-primary">
          Step {step} of 2 · Permanent
        </div>
        <h2 id="delete-host-title" className="mt-1 font-display text-2xl text-ink">
          Delete {businessName}?
        </h2>

        {step === 1 && (
          <>
            <p className="mt-3 text-sm text-mute">
              This removes the host and everything that belongs to them. It can&apos;t be undone.
              To stop them selling without losing any records, suspend them instead.
            </p>
            {!summary && !error && <p className="mt-4 text-sm text-mute">Checking what they have…</p>}
            {summary && (
              <ul className="mt-4 space-y-1.5 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-ink">
                <li>{plural(summary.venues, 'venue')}</li>
                <li>
                  {plural(summary.events, 'event')}
                  {summary.upcomingEvents > 0 && `, ${summary.upcomingEvents} still upcoming`}
                </li>
                <li>{plural(summary.bookings, 'booking')}, with their tickets and form answers</li>
                {summary.upcomingTickets > 0 && (
                  <li className="text-primary">
                    {plural(summary.upcomingTickets, 'ticket')} for upcoming events will stop working.
                    Those buyers paid the host directly, so any refunds are between them and the host.
                  </li>
                )}
                {summary.feesDueINR > 0 && (
                  <li className="text-primary">
                    {formatINR(summary.feesDueINR)} in Rhoddo fees is still unpaid and its record will be lost.
                  </li>
                )}
                {summary.checkoutsInProgress > 0 && (
                  <li className="text-primary">
                    Buyers are paying right now, so this can&apos;t be deleted for about 15 minutes.
                  </li>
                )}
              </ul>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <p className="mt-3 text-sm text-mute">
              Type <span className="font-medium text-ink">{businessName}</span> to confirm.
            </p>
            <input
              ref={inputRef}
              className="input mt-3"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && remove()}
              aria-label="Business name"
              autoComplete="off"
              disabled={busy}
            />
          </>
        )}

        {error && (
          <p role="alert" className="mt-3 text-sm text-primary">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button ref={cancelRef} type="button" className="btn-ghost" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          {step === 1 ? (
            <button
              type="button"
              className="btn-danger disabled:opacity-50"
              disabled={!summary || summary.checkoutsInProgress > 0}
              onClick={() => {
                setError(null);
                setStep(2);
              }}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className={`${nameMatches ? 'btn-primary' : 'btn-danger'} disabled:opacity-50`}
              disabled={!nameMatches || busy}
              onClick={remove}
            >
              {busy ? 'Deleting…' : 'Delete permanently'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
