// The homepage's "happening now" banner: the next upcoming event, with a link to its
// registration page and a button to open it in the app. Shows nothing if there's no
// upcoming event or the API can't be reached, so the homepage never breaks.

import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { eventHasEnded, formatPlace, formatWhen, type PublicEvent } from '@/lib/publicEvent';
import { formatINR } from '@/lib/format';
import { eventWords } from '@/lib/eventWords';
import { OpenInAppButton } from './OpenInAppButton';

async function nextEvent(): Promise<PublicEvent | null> {
  try {
    const res = await fetch(`${API_URL}/events`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    const events: PublicEvent[] = Array.isArray(data) ? data : data.events ?? [];
    const upcoming = events
      .filter((e) => !eventHasEnded(e))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0] ?? null;
  } catch {
    return null;
  }
}

export async function FeaturedEvent() {
  const event = await nextEvent();
  if (!event) return null;

  const w = eventWords(event.category);
  const prices = event.tiers?.length ? event.tiers.map((t) => t.priceINR) : [event.priceFromINR];
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const entry = highest <= 0 ? 'Free' : lowest <= 0 ? `Free – ${formatINR(highest)}` : `From ${formatINR(lowest)}`;
  const soldOut = !!event.tiers?.length && event.tiers.every((t) => t.left <= 0);
  const href = event.slug ? `/r/${encodeURIComponent(event.slug)}` : `/event/${encodeURIComponent(event.id)}`;

  return (
    <section aria-labelledby="featured-title" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="label">{w.registration ? 'Now open for registration' : 'Coming up'}</div>
        <div className="mt-4 grid overflow-hidden rounded-3xl border border-line bg-panel shadow-card md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-bg md:aspect-auto md:min-h-[380px]" aria-label={event.title}>
            {event.image && (
              <>
                {/* Posters are often tall, so the image is never cropped. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.image} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.image} alt="" className="relative h-full w-full object-contain" />
              </>
            )}
          </Link>
          <div className="flex flex-col justify-center gap-5 p-6 sm:p-10">
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${soldOut ? 'bg-line text-mute' : 'bg-pine/15 text-pine'}`}>
                {!soldOut && <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-pine align-middle" />}
                {soldOut ? (w.registration ? 'Registration full' : 'Sold out') : w.registration ? 'Registration open' : 'Booking open'}
              </span>
              {event.category && <span className="rounded-full border border-line px-3 py-1 text-xs capitalize text-mute">{event.category}</span>}
            </div>
            <div>
              <h2 id="featured-title" className="font-display text-3xl leading-tight text-ink md:text-4xl">
                {event.title}
              </h2>
              {event.tagline && <p className="mt-2 text-mute">{event.tagline}</p>}
            </div>
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2"><dt className="w-14 shrink-0 text-mute">When</dt><dd className="text-ink">{formatWhen(event.date)}</dd></div>
              <div className="flex gap-2"><dt className="w-14 shrink-0 text-mute">Where</dt><dd className="text-ink">{formatPlace(event)}</dd></div>
              <div className="flex gap-2"><dt className="w-14 shrink-0 text-mute">Entry</dt><dd className="font-medium text-ink">{entry}</dd></div>
            </dl>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={href} className="btn-primary flex-1 py-3.5 text-base">
                {soldOut ? 'View event' : w.registration ? 'Register now' : 'Book now'}
              </Link>
              <OpenInAppButton eventId={event.id} className="btn-ghost flex-1 py-3.5 text-base" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
