import { cache } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { API_URL } from '@/lib/api';
import { eventShareUrl } from '@/lib/eventLink';
import { formatINR } from '@/lib/format';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rhoddo.app';

type Props = { params: Promise<{ id: string }> };

type PublicEvent = {
  id: string;
  title: string;
  tagline: string;
  about: string;
  district: string;
  date: string;
  image: string;
  priceFromINR: number;
  venue?: { name: string } | null;
};

type Lookup = { event: PublicEvent } | { problem: 'missing' | 'unavailable' };

// Used by both the page and its link preview, so one visit makes one request.
const loadEvent = cache(async (id: string): Promise<Lookup> => {
  try {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (res.status === 404) return { problem: 'missing' };
    if (!res.ok) return { problem: 'unavailable' };
    const data = (await res.json()) as { event: PublicEvent };
    return { event: data.event };
  } catch {
    return { problem: 'unavailable' };
  }
});

// Written out in Sikkim time, because the server may run in another time zone.
function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatPlace(event: PublicEvent): string {
  return [event.venue?.name, event.district].filter(Boolean).join(', ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await loadEvent(id);
  if (!('event' in result)) {
    return { title: 'Event not available · Rhoddo', robots: { index: false } };
  }

  const { event } = result;
  const description = `${formatWhen(event.date)} · ${formatPlace(event)}`;
  return {
    title: `${event.title} · Rhoddo`,
    description,
    openGraph: {
      type: 'website',
      siteName: 'Rhoddo',
      title: event.title,
      description,
      url: eventShareUrl(event.id),
      images: event.image ? [{ url: event.image }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: event.title, description },
  };
}

export default async function SharedEventPage({ params }: Props) {
  const { id } = await params;
  const result = await loadEvent(id);
  const userAgent = (await headers()).get('user-agent') ?? '';
  const isAndroid = /android/i.test(userAgent);

  // A real link usually opens the app before this page loads. This button is for apps
  // whose built-in browser keeps links inside it, such as Instagram. It opens the app
  // if it's installed, and the Play Store if it isn't.
  const openInApp = `intent://event/${encodeURIComponent(id)}#Intent;scheme=rhoddo;package=com.rhoddo.app;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;
  const webVersion = `/app/event/${encodeURIComponent(id)}`;

  return (
    <div className="theme-site min-h-screen bg-bg text-ink">
      <div className="mx-auto max-w-lg px-4 py-6">
        <Link href="/" className="inline-block" aria-label="Rhoddo home">
          <Logo className="h-8 w-auto" />
        </Link>

        {'event' in result ? (
          <div className="card mt-6 overflow-hidden">
            {result.event.image && (
              // A plain image, because event photos can come from any host.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.event.image} alt="" className="aspect-video w-full object-cover" />
            )}
            <div className="p-5">
              <h1 className="font-display text-3xl text-ink">{result.event.title}</h1>
              {result.event.tagline && <p className="mt-1 text-sm text-mute">{result.event.tagline}</p>}
              <dl className="mt-4 space-y-1 text-sm text-ink">
                <div>{formatWhen(result.event.date)}</div>
                <div>{formatPlace(result.event)}</div>
                <div className="text-gold">
                  {result.event.priceFromINR > 0 ? `From ${formatINR(result.event.priceFromINR)}` : 'Free'}
                </div>
              </dl>

              <div className="mt-6 flex flex-col gap-3">
                {isAndroid ? (
                  <>
                    <a href={openInApp} className="btn-primary text-center">Open in Rhoddo app</a>
                    <a href={webVersion} className="btn-ghost text-center">Continue in browser</a>
                  </>
                ) : (
                  <>
                    <a href={webVersion} className="btn-primary text-center">View and book</a>
                    <a href={PLAY_STORE_URL} className="btn-ghost text-center">Get the Android app</a>
                  </>
                )}
              </div>

              {result.event.about && (
                <p className="mt-6 whitespace-pre-line text-sm text-mute">{result.event.about}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="card mt-6 p-6">
            <h1 className="font-display text-2xl text-ink">
              {result.problem === 'missing' ? 'This event isn’t available' : 'We couldn’t load this event'}
            </h1>
            <p className="mt-2 text-sm text-mute">
              {result.problem === 'missing'
                ? 'The host may have taken it down.'
                : 'Please try the link again in a moment.'}
            </p>
            <a href="/app" className="btn-primary mt-5 block text-center">See other events</a>
          </div>
        )}
      </div>
    </div>
  );
}
