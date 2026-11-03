import { formatINR } from '@/lib/format';
import { PER_TICKET_FEE_INR, SMALL_EVENT_MAX_TICKETS } from '@/lib/pricing';

export type EventFees = {
  alwaysFree: boolean;
  paidTickets: number;
  freeTicketsUsed: number;
  chargedTickets: number;
  feeINR: number;
  ticketsUntilFeeApplies: number | null;
};

export function EventFeeCard({ fees }: { fees: EventFees }) {
  return (
    <div className="card p-6">
      <div className="label">Rhoddo fee for this event</div>
      <div className="mt-2 font-display text-3xl text-gold">{formatINR(fees.feeINR)}</div>
      <p className="mt-2 text-sm text-mute">{explain(fees)}</p>
    </div>
  );
}

function explain(f: EventFees): string {
  if (f.alwaysFree) return 'Cultural events are always free.';
  const sold = `${f.paidTickets} paid ticket${f.paidTickets === 1 ? '' : 's'} sold`;
  if (f.ticketsUntilFeeApplies !== null) {
    return `${sold}. No fee up to ${SMALL_EVENT_MAX_TICKETS} tickets, and ${f.ticketsUntilFeeApplies} more would take this event past that limit.`;
  }
  return `${sold} · ${f.freeTicketsUsed} covered by free tickets · ${f.chargedTickets} charged at ₹${PER_TICKET_FEE_INR}.`;
}
