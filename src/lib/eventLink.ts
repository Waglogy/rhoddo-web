// The one link people share for an event. The Android app is set up to open these
// directly, and anyone without the app gets the page at src/app/event/[id].
const SITE_URL = 'https://rhoddo.com';

export function eventShareUrl(eventId: string): string {
  return `${SITE_URL}/event/${encodeURIComponent(eventId)}`;
}
