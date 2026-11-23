// The homepage's open events. The newest event still taking sign-ups (admins' "show first"
// ranking wins) fills the hero, so it's the first thing people see on rhoddo.com, with its
// registration link and a button to open it in the app. If there's none, or the API can't
// be reached, the hero falls back to the app preview, so the homepage never breaks.

import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { eventHasEnded, formatPlace, formatWhen, registrationClosed, type PublicEvent } from '@/lib/publicEvent';
import { formatINR } from '@/lib/format';
import { eventWords } from '@/lib/eventWords';
import { OpenInAppButton } from './OpenInAppButton';
import { AppHomeMock } from './AppHomeMock';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rhoddo.app';

/** How many open events the homepage shows: one in the hero, the rest as small links under it. */
const MAX_EVENTS = 3;

const time = (iso?: string | null) => (iso ? new Date(iso).getTime() : 0);

export async function loadOpenEvents(): Promise<PublicEvent[]> {
  try {
    const res = await fetch(`${API_URL}/events`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = await res.json();
    const events: PublicEvent[] = Array.isArray(data) ? data : data.events ?? [];
    return events
      .filter((e) => !eventHasEnded(e) && !registrationClosed(e))
      // Admins' ranking first, then the most recently added.
      .sort((a, b) => (b.showFirstRank ?? -1) - (a.showFirstRank ?? -1) || time(b.createdAt) - time(a.createdAt))
      .slice(0, MAX_EVENTS);
  } catch {
    return [];
  }
}

const linkFor = (e: PublicEvent) => (e.slug ? `/r/${encodeURIComponent(e.slug)}` : `/event/${encodeURIComponent(e.id)}`);

function entryLabel(e: PublicEvent) {
  const prices = e.tiers?.length ? e.tiers.map((t) => t.priceINR) : [e.priceFromINR];
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  return highest <= 0 ? 'Free' : lowest <= 0 ? `Free – ${formatINR(highest)}` : `From ${formatINR(lowest)}`;
}

/** The newest open event, as the hero's main card. */
export function HeroEvent({ event, more }: { event: PublicEvent; more: PublicEvent[] }) {
  const w = eventWords(event.category);
  const soldOut = !!event.tiers?.length && event.tiers.every((t) => t.left <= 0);
  const href = linkFor(event);

  return (
    <div className="w-full max-w-[520px]">
      <section aria-labelledby="featured-title" className="overflow-hidden rounded-3xl border border-line bg-panel shadow-card">
        <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-[#0f2a1d]" aria-label={event.title}>
          {event.image && (
            // Posters come in every shape, so the image is never cropped.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-contain" fetchPriority="high" />
          )}
        </Link>
        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <span
              className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                soldOut ? 'bg-line text-mute' : 'bg-pine/15 text-pine'
              }`}
            >
              {!soldOut && <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-pine align-middle" />}
              {soldOut ? (w.registration ? 'Registration full' : 'Sold out') : w.registration ? 'Now open for registration' : 'Booking open'}
            </span>
            <h2 id="featured-title" className="font-display text-2xl leading-tight text-ink sm:text-[1.7rem]">
              <Link href={href} className="hover:underline">
                {event.title}
              </Link>
            </h2>
            {event.tagline && <p className="mt-1 text-sm text-mute">{event.tagline}</p>}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-mute">When</dt>
            <dd className="text-ink">{formatWhen(event.date)}</dd>
            <dt className="text-mute">Where</dt>
            <dd className="text-ink">{formatPlace(event)}</dd>
            <dt className="text-mute">Entry</dt>
            <dd className="font-medium text-ink">{entryLabel(event)}</dd>
            {event.registrationClosesAt && (
              <>
                <dt className="text-mute">Closes</dt>
                <dd className="text-ink">{formatWhen(event.registrationClosesAt)}</dd>
              </>
            )}
          </dl>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link href={href} className="btn-primary flex-1 py-3 text-center text-base">
              {soldOut ? 'View event' : w.registration ? 'Register now' : 'Book now'}
            </Link>
            <OpenInAppButton eventId={event.id} className="btn-ghost flex-1 py-3 text-center text-base" />
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <ul className="mt-3 space-y-2">
          {more.map((e) => (
            <li key={e.id}>
              <Link
                href={linkFor(e)}
                className="flex items-center gap-3 rounded-2xl border border-line bg-panel/90 p-2.5 transition hover:border-ink/30"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-bg">
                  {e.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">{e.title}</div>
                  <div className="truncate text-xs text-mute">{formatWhen(e.date)}</div>
                </div>
                <span className="shrink-0 text-xs font-medium text-gold">{entryLabel(e)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The app, with its preview phone: shown below the hero when the hero holds an event. */
export function AppShowcase() {
  return (
    <section id="app" aria-labelledby="app-title" className="relative overflow-hidden border-t border-line">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-[460px] w-[460px] rounded-full bg-pine/20 blur-[140px]" />
        <div className="absolute right-[-120px] bottom-[-80px] h-[420px] w-[420px] rounded-full bg-gold/15 blur-[140px]" />
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1fr_auto] md:py-24">
        <div>
          <div className="label">The Rhoddo app</div>
          <h2 id="app-title" className="mt-2 max-w-xl font-display text-4xl leading-tight text-ink md:text-5xl">
            Register here, or in the app.
          </h2>
          <p className="mt-4 max-w-xl text-base text-mute">
            One Rhoddo account works on the website and in the app, so a race you register for here is waiting in the
            app too.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-ink">
            {[
              ['Your pass on your phone', 'QR passes for every runner, ready for race-day check-in.'],
              ['Race updates', 'Reminders and announcements from the organiser.'],
              ['Races and workshops across Sikkim', 'Find what’s on by district and date.'],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pine/15 text-[11px] text-pine" aria-hidden>
                  ✓
                </span>
                <span>
                  <span className="font-medium">{t}.</span> <span className="text-mute">{d}</span>
                </span>
              </li>
            ))}
          </ul>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-line bg-panel px-5 py-3 transition hover:border-gold"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-ink" aria-hidden>
              <path d="M3.6 2.5C3.22 2.85 3 3.4 3 4.1v15.8c0 .7.22 1.25.6 1.6l8.4-9.5L3.6 2.5Zm10.06 9 2.7-3.05L5.55 2.27c-.36-.2-.7-.27-1-.21l9.11 9.44Zm0 1L4.55 21.94c.3.06.64-.01 1-.21l10.81-6.18-2.7-3.05Zm6.5-3.7-3.32-1.9-2.96 3.34 2.96 3.34 3.32-1.9c1.05-.6 1.05-2.27 0-2.88Z" />
            </svg>
            <span className="text-left">
              <span className="block text-[10px] uppercase tracking-wider text-gold">Get it on</span>
              <span className="block font-display text-lg text-ink">Google Play</span>
            </span>
          </a>
          <p className="mt-3 text-xs text-mute">Android app on Google Play. iPhone app coming soon.</p>
        </div>

        {/* The app's home screen, set into the hills */}
        <div className="relative flex justify-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(232,184,74,0.18)_0%,transparent_65%)]" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 hidden h-[640px] w-[1100px] -translate-x-1/2 bg-[image:var(--art-peaks)] bg-contain bg-bottom bg-no-repeat opacity-80 md:block [mask-image:linear-gradient(to_right,transparent_20%,black_38%)]" />
          <div className="theme-app-light relative z-10 [zoom:0.8] sm:[zoom:0.9] lg:[zoom:1]">
            <AppHomeMock />
          </div>
        </div>
      </div>
    </section>
  );
}
