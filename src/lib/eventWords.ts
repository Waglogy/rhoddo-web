// Sports events (runs, races) and workshops are registrations, not bookings: people register and get a pass.
// Every other event keeps booking/ticket wording. Keep in step with the copies in rhoddo-api
// (src/lib/eventWords.ts) and rhoddo-app- (src/lib/eventWords.ts).

export const REGISTRATION_CATEGORIES = ['sports', 'workshop'];

/** Who signs up, for headings: runners at a race, participants at a workshop. */
export const participantsWord = (category: string | null | undefined) =>
  category === 'sports' ? 'Runners' : category === 'workshop' ? 'Participants' : 'Details';

export function isRegistrationEvent(category: string | null | undefined): boolean {
  return !!category && REGISTRATION_CATEGORIES.includes(category);
}

export function eventWords(category: string | null | undefined) {
  return isRegistrationEvent(category)
    ? {
        registration: true,
        booking: 'registration',
        bookings: 'registrations',
        book: 'register',
        booked: 'registered',
        ticket: 'pass',
        tickets: 'passes',
        sold: 'registered',
      }
    : {
        registration: false,
        booking: 'booking',
        bookings: 'bookings',
        book: 'book',
        booked: 'booked',
        ticket: 'ticket',
        tickets: 'tickets',
        sold: 'sold',
      };
}

export type EventWords = ReturnType<typeof eventWords>;

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Wording for host pages that cover all of a host's events, from `wording` on /organizer/me:
 * only sports events -> registrations, no sports events -> bookings, both -> both words.
 */
export type HostWording = 'booking' | 'registration' | 'mixed';

export function hostWords(wording: HostWording | undefined) {
  if (wording === 'registration') {
    return {
      Bookings: 'Registrations',
      bookings: 'registrations',
      booking: 'registration',
      Sales: 'Registrations',
      tickets: 'passes',
      scan: 'Scan passes',
      sell: 'take paid registrations',
      sellTickets: 'take registrations',
    };
  }
  if (wording === 'mixed') {
    return {
      Bookings: 'Bookings & registrations',
      bookings: 'bookings and registrations',
      booking: 'booking or registration',
      Sales: 'Sales & registrations',
      tickets: 'tickets and passes',
      scan: 'Scan tickets',
      sell: 'sell paid tickets and registrations',
      sellTickets: 'sell tickets and take registrations',
    };
  }
  return {
    Bookings: 'Bookings',
    bookings: 'bookings',
    booking: 'booking',
    Sales: 'Ticket sales',
    tickets: 'tickets',
    scan: 'Scan tickets',
    sell: 'sell paid tickets',
    sellTickets: 'sell tickets',
  };
}
