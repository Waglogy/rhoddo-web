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
  registrationClosed,
  type EventLookup,
} from '@/lib/publicEvent';
import { RegisterButton, RegisterLauncher } from './RegisterLauncher';
import { EventGallery } from './EventGallery';
import { AboutText } from './AboutText';
import { eventWords } from '@/lib/eventWords';
import { LEGAL_LINKS } from '@/components/LegalShell';
import { SupportNote } from '@/components/SupportNote';

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
      <footer className="border-t border-line">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-6 pb-28 text-xs text-mute sm:px-6 lg:pb-6">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}

async function EventBody({ event, isAndroid }: { event: Extract<EventLookup, { event: unknown }>['event']; isAndroid: boolean }) {
  const ended = eventHasEnded(event);
  // Closed to new sign-ups by the host, but the event hasn't happened yet.
  const closed = !ended && registrationClosed(event);
  const user = ended || closed ? null : await loadSignedInBuyer();
  // The app opens these links by itself when installed. This is for in-app browsers
  // such as Instagram's, which keep links inside them. Falls back to the Play Store.
  const openInApp = `intent://event/${encodeURIComponent(event.id)}#Intent;scheme=rhoddo;package=com.rhoddo.app;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;
  const prices = event.tiers.length ? event.tiers.map((t) => t.priceINR) : [event.priceFromINR];
  const [lowest, highest] = [Math.min(...prices), Math.max(...prices)];
  const entry = highest <= 0 ? 'Free' : lowest <= 0 ? `Free – ${formatINR(highest)}` : `From ${formatINR(lowest)}`;
  const w = eventWords(event.category);
  const soldOut = event.tiers.length > 0 && event.tiers.every((t) => t.left <= 0);
  const action = w.registration ? 'Register now' : 'Book now';
  const fullLabel = w.registration ? 'Registration full' : 'Sold out';
  const closedLabel = w.registration ? 'Registration closed' : 'Booking closed';
  const status = ended ? 'Event ended' : closed ? closedLabel : soldOut ? fullLabel : w.registration ? 'Registration open' : 'Booking open';
  const closesOn = event.registrationClosesAt && !closed ? formatWhen(event.registrationClosesAt) : null;
  const hasTerms = Boolean(event.termsText?.trim() || event.termsPdfUrl);
  const images = [event.image, ...(event.gallery ?? [])].filter(Boolean);
  const registerEvent = {
    id: event.id,
    title: event.title,
    category: event.category,
    tiers: event.tiers,
    form: event.form ?? null,
    date: event.date,
    termsText: event.termsText,
    termsPdfUrl: event.termsPdfUrl,
    consentFormUrl: event.consentFormUrl,
  };
  const open = !ended && !closed;

  return (
    <div className="pb-24 lg:pb-0">
      {isAndroid && open && (
        <a
          href={openInApp}
          className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm"
        >
          <span className="text-mute">Have the Rhoddo app?</span>
          <span className="font-medium text-primary">Open in app →</span>
        </a>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0 space-y-8">
          <EventGallery images={images} title={event.title} />

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  !open || soldOut ? 'bg-line text-mute' : 'bg-pine/15 text-pine'
                }`}
              >
                {open && !soldOut && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-pine align-middle" />}
                {status}
              </span>
              {event.category && (
                <span className="rounded-full border border-line px-3 py-1 text-xs capitalize text-mute">{event.category}</span>
              )}
            </div>
            <h1 className="font-display text-3xl leading-tight text-ink sm:text-5xl">{event.title}</h1>
            {event.tagline && <p className="text-base text-mute sm:text-lg">{event.tagline}</p>}
          </div>

          <dl className="divide-y divide-line rounded-2xl border border-line bg-panel lg:hidden">
            <Fact icon="calendar" label="When" value={formatWhen(event.date)} />
            <Fact icon="pin" label="Where" value={formatPlace(event)} />
            <Fact icon="ticket" label="Entry" value={entry} />
            {closesOn && <Fact icon="clock" label="Closes" value={`${w.registration ? 'Registration' : 'Booking'} closes ${closesOn}`} />}
          </dl>

          {event.tiers.length > 0 && (
            <section aria-labelledby="passes-title" className="space-y-3">
              <h2 id="passes-title" className="font-display text-2xl text-ink">
                {w.registration ? 'Race passes' : 'Tickets'}
              </h2>
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
                {event.tiers.map((t) => {
                  const out = t.left <= 0;
                  const prize = t.perks.find((perk) => /prize|cash/i.test(perk));
                  const others = t.perks.filter((perk) => perk !== prize);
                  const row = (
                    <>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-medium text-ink">{t.name}</span>
                          {t.minAge ? <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-mute">Ages {t.minAge}+</span> : null}
                          {out ? (
                            <span className="rounded-full bg-line px-2 py-0.5 text-[11px] text-mute">{w.registration ? 'Full' : 'Sold out'}</span>
                          ) : (
                            t.left <= 20 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">Only {t.left} left</span>
                          )}
                        </div>
                        {prize && <p className="mt-1 text-sm text-gold">🏆 {prize.replace(/^cash prizes?\s*/i, '')}</p>}
                        {others.length > 0 && <p className="mt-0.5 text-sm text-mute">Includes {others.join(', ').toLowerCase()}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-display text-xl text-ink">{t.priceINR > 0 ? formatINR(t.priceINR) : 'Free'}</span>
                        {open && !out && <span className="text-xl text-mute" aria-hidden>›</span>}
                      </div>
                    </>
                  );
                  return (
                    <li key={t.id}>
                      {!open || out ? (
                        <div className="flex items-start gap-4 px-4 py-4 opacity-60 sm:px-5">{row}</div>
                      ) : (
                        <RegisterButton tierId={t.id} className="flex w-full items-start gap-4 px-4 py-4 text-left transition hover:bg-bg sm:px-5">
                          {row}
                        </RegisterButton>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {event.about && (
            <section aria-labelledby="about-title" className="space-y-3">
              <h2 id="about-title" className="font-display text-2xl text-ink">About this event</h2>
              <AboutText text={event.about} />
            </section>
          )}

          {(hasTerms || event.consentFormUrl) && (
            <section aria-labelledby="terms-title" className="space-y-3">
              <h2 id="terms-title" className="font-display text-2xl text-ink">Terms & forms</h2>
              {hasTerms && (
                <p className="text-sm text-mute">
                  You&apos;ll be asked to read and accept the organiser&apos;s terms and conditions before you{' '}
                  {w.registration ? 'register' : 'book'}.
                </p>
              )}
              {event.termsText?.trim() && (
                <details className="group rounded-2xl border border-line bg-panel">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-ink">
                    <span className="mr-2 inline-block transition group-open:rotate-90">›</span>Read the terms and conditions
                  </summary>
                  <div className="max-h-[60vh] overflow-y-auto whitespace-pre-line border-t border-line px-4 py-3 text-sm leading-relaxed text-mute">
                    {event.termsText.trim()}
                  </div>
                </details>
              )}
              <div className="flex flex-wrap gap-2">
                {event.termsPdfUrl && (
                  <a href={event.termsPdfUrl} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-2 text-sm">
                    📄 Terms and conditions (PDF)
                  </a>
                )}
                {event.consentFormUrl && (
                  <a href={event.consentFormUrl} target="_blank" rel="noreferrer" download className="btn-ghost inline-flex items-center gap-2 text-sm">
                    ⬇ Parent / guardian consent form (PDF)
                  </a>
                )}
              </div>
              {event.consentFormUrl && (
                <p className="text-xs text-mute">
                  For anyone under 18 on the event day: print this form, have a parent or guardian sign it, and upload a
                  photo or PDF of it when you register.
                </p>
              )}
            </section>
          )}

          {event.hostName && (
            <section className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-xl text-primary">
                {event.hostName.trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="label">Organised by</div>
                <div className="truncate font-medium text-ink">{event.hostName}</div>
              </div>
            </section>
          )}

          {open && <SupportNote context={`registering for ${event.title}`} />}
        </div>

        {/* Desktop: a summary that stays in view */}
        <aside className="hidden lg:sticky lg:top-6 lg:block">
          <div className="card space-y-5 p-6">
            <div>
              <div className="label">Entry</div>
              <div className="font-display text-3xl text-ink">{entry}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3"><Icon name="calendar" /><span className="text-ink">{formatWhen(event.date)}</span></div>
              <div className="flex gap-3"><Icon name="pin" /><span className="text-ink">{formatPlace(event)}</span></div>
              {closesOn && (
                <div className="flex gap-3"><Icon name="clock" /><span className="text-ink">{w.registration ? 'Registration' : 'Booking'} closes {closesOn}</span></div>
              )}
            </div>
            {ended ? (
              <div className="rounded-xl bg-bg px-4 py-3 text-sm text-mute">This event has already taken place.</div>
            ) : closed ? (
              <div className="rounded-xl bg-bg px-4 py-3 text-sm text-mute">{closedLabel}. New {w.registration ? 'registrations' : 'bookings'} are no longer taken.</div>
            ) : (
              <RegisterButton disabled={soldOut}>{soldOut ? fullLabel : action}</RegisterButton>
            )}
            {open && (
              <ul className="space-y-1.5 border-t border-line pt-4 text-xs text-mute">
                <li>✓ Passes sent to your email</li>
                <li>✓ Register up to 5 people at once</li>
                <li>✓ Secure payment by Razorpay, no extra fees</li>
              </ul>
            )}
          </div>
        </aside>
      </div>

      {open && (
        <RegisterLauncher
          event={registerEvent}
          initialUser={user}
          priceLabel={entry}
          actionLabel={action}
          soldOutLabel={fullLabel}
        />
      )}
    </div>
  );
}

const ICONS = {
  calendar: 'M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  ticket: 'M4 8a2 2 0 0 0 0 4v4h16v-4a2 2 0 0 0 0-4V4H4v4zM14 4v16',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="mt-0.5 shrink-0 text-primary" aria-hidden>
      <path d={ICONS[name]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Fact({ icon, label, value }: { icon: keyof typeof ICONS; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon name={icon} />
      <dt className="sr-only">{label}</dt>
      <dd className="text-sm text-ink">{value}</dd>
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
