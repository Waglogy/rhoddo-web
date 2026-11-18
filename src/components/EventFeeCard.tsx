import { formatINR } from '@/lib/format';
import { formatPercent } from '@/lib/pricing';

export type EventFees = {
  commissionPercent: number;
  paidTickets: number;
  salesINR: number;
  feeINR: number;
};

export function EventFeeCard({
  fees,
  reviewStatus,
}: {
  fees: EventFees;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}) {
  return (
    <div className="card p-6">
      <div className="label">Rhoddo fee for this event</div>
      <div className="mt-2 font-display text-3xl text-gold">{formatINR(fees.feeINR)}</div>
      <p className="mt-2 text-sm text-mute">{explain(fees, reviewStatus)}</p>
    </div>
  );
}

function explain(f: EventFees, reviewStatus: 'pending' | 'approved' | 'rejected'): string {
  if (reviewStatus !== 'approved') {
    return 'Rhoddo sets this event’s commission when it reviews the event.';
  }
  const rate = `Commission ${formatPercent(f.commissionPercent)} of each booking.`;
  if (f.paidTickets === 0) return `${rate} No paid tickets sold yet.`;
  return `${rate} ${f.paidTickets} paid ticket${f.paidTickets === 1 ? '' : 's'} sold for ${formatINR(f.salesINR)}.`;
}
