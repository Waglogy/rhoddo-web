import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { eventLink } from '@/lib/eventLink';
import { formatINR } from '@/lib/format';
import {
  eventHasEnded,
  formatPlace,
  formatWhen,
  loadSignedInBuyer,
  type EventLookup,
} from '@/lib/publicEvent';
import { RegisterPanel } from './RegisterPanel';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rhoddo.app';

/** Link preview for WhatsApp, Instagram and search results. */
export function eventMetadata(result: EventLookup): Metadata {
  if (!('event' in result)) {
    return { title: 'Event not available · Rhoddo', robots: { index: false } };
  }
  const { event } = result;
  const description = `${formatWhen(event.date)} · ${formatPlace(event)}. Register on Rhoddo.`;
  return {
    title: `${event.title} · Rhoddo`,
    description,
    alternates: { canonical: eventLink(event) },
    openGraph: {
      type: 'website',
      siteName: 'Rhoddo',
      title: event.title,
      description,
      url: eventLink(event),
      images: event.image ? [{ url: event.image }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: event.title, description },
  };
}

/** The event's public page: details, plus registration and payment on the same backend as the app. */
export async function EventRegistration({ result }: { result: EventLookup }) {
  const isAndroid = /android/i.test((await headers()).get('user-agent') ?? '');

  return (
    <div className="theme-site min-h-screen bg-bg text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" aria-label="Rhoddo home">
          <Logo className="h-8 w-auto" />
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {'event' in result ? <EventBody event={result.event} isAndroid={isAndroid} /> : <Unavailable problem={result.problem} />}
      </main>
    </div>
  );
}

async function EventBody({ event, isAndroid }: { event: Extract<EventLookup, { event: unknown }>['event']; isAndroid: boolean }) {
  const ended = eventHasEnded(event);
  const user = ended ? null : await loadSignedInBuyer();
  // The app opens these links by itself when installed. This is for in-app browsers
  // such as Instagram's, which keep links inside them. Falls back to the Play Store.
  const openInApp = `intent://event/${encodeURIComponent(event.id)}#Intent;scheme=rhoddo;package=com.rhoddo.app;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;
  const prices = event.tiers.length ? event.tiers.map((t) => t.priceINR) : [event.priceFromINR];
  const [lowest, highest] = [Math.min(...prices), Math.max(...prices)];
  const entry = highest <= 0 ? 'Free' : lowest <= 0 ? `Free – ${formatINR(highest)}` : `From ${formatINR(lowest)}`;

  return (
    <>
      {isAndroid && !ended && (
        <a
          href={openInApp}
          className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm"
        >
          <span className="text-mute">Have the Rhoddo app?</span>
          <span className="font-medium text-primary">Open in app →</span>
        </a>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="min-w-0 space-y-6">
          {event.image && (
            // A plain image, because event photos can come from any host.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.image} alt="" className="aspect-[16/9] w-full rounded-3xl object-cover" />
          )}
          <div>
            <h1 className="font-display text-3xl leading-tight text-ink sm:text-5xl">{event.title}</h1>
            {event.tagline && <p className="mt-2 text-base text-mute sm:text-lg">{event.tagline}</p>}
          </div>
          <dl className="grid gap-3 sm:grid-cols-3">
            <Fact label="When" value={formatWhen(event.date)} />
            <Fact label="Where" value={formatPlace(event)} />
            <Fact label="Entry" value={entry} />
          </dl>
          {event.about && (
            <section className="hidden lg:block">
              <h2 className="label mb-2">About</h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/90">{event.about}</p>
            </section>
          )}
          {event.hostName && <p className="hidden text-sm text-mute lg:block">Hosted by {event.hostName}</p>}
        </div>

        <aside className="card p-5 sm:p-6 lg:sticky lg:top-6">
          {ended ? (
            <div>
              <h2 className="font-display text-2xl text-ink">Registration closed</h2>
              <p className="mt-2 text-sm text-mute">This event has already taken place.</p>
            </div>
          ) : (
            <RegisterPanel
              event={{ id: event.id, title: event.title, category: event.category, tiers: event.tiers, form: event.form ?? null }}
              initialUser={user}
            />
          )}
        </aside>

        {/* On phones, the details come after registration so the form is near the top. */}
        {(event.about || event.hostName) && (
          <section className="space-y-3 lg:hidden">
            {event.about && (
              <>
                <h2 className="label">About</h2>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/90">{event.about}</p>
              </>
            )}
            {event.hostName && <p className="text-sm text-mute">Hosted by {event.hostName}</p>}
          </section>
        )}
      </div>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel px-4 py-3">
      <dt className="label">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

function Unavailable({ problem }: { problem: 'missing' | 'unavailable' }) {
  return (
    <div className="card mx-auto mt-6 max-w-lg p-6">
      <h1 className="font-display text-2xl text-ink">
        {problem === 'missing' ? 'This event isn’t available' : 'We couldn’t load this event'}
      </h1>
      <p className="mt-2 text-sm text-mute">
        {problem === 'missing' ? 'The host may have taken it down, or the link may have changed.' : 'Please try the link again in a moment.'}
      </p>
      <a href={PLAY_STORE_URL} className="btn-primary mt-5 block text-center">
        See other events in the app
      </a>
    </div>
  );
}
