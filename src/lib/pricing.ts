// Display copies of Rhoddo's host pricing. The backend's lib/fees.ts decides what's charged.
export const PER_TICKET_FEE_INR = 9;
export const SMALL_EVENT_MAX_TICKETS = 10;

/** A booking's fee can be bigger than its own tickets when it took the event past the limit. */
export function includesEarlierTickets(qty: number, platformFeeINR: number): boolean {
  return platformFeeINR > qty * PER_TICKET_FEE_INR;
}
