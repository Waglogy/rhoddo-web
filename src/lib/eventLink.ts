// The links people share for an event. rhoddo.com/r/<slug> is the registration page,
// with a short name the host chooses. rhoddo.com/event/<id> is the older form, still
// used for events without a link name, and both show the same page. The Android app
// opens either one for anyone who has it.
const SITE_URL = 'https://rhoddo.com';

export function eventShareUrl(eventId: string): string {
  return `${SITE_URL}/event/${encodeURIComponent(eventId)}`;
}

export function registrationUrl(slug: string): string {
  return `${SITE_URL}/r/${encodeURIComponent(slug)}`;
}

/** The best link for an event: its short registration link when it has one. */
export function eventLink(event: { id: string; slug?: string | null }): string {
  return event.slug ? registrationUrl(event.slug) : eventShareUrl(event.id);
}

/** Same rules as the API's lib/eventSlug.ts: lowercase words joined by dashes. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
}
