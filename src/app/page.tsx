import Link from 'next/link';
import { Logo } from '@/components/Logo';
import type { Metadata } from 'next';
import { AppHomeMock } from '@/components/AppHomeMock';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccountLink } from '@/components/account/AccountLink';
import { AppShowcase, HappeningNow, HeroEvent, loadOpenEvents } from '@/components/FeaturedEvent';
import { loadSignedInBuyer } from '@/lib/publicEvent';

export const metadata: Metadata = {
  title: 'Rhoddo — Races & events across Sikkim',
  description:
    'Register for marathons, trail runs, cycle races, tournaments and hands-on workshops across Sikkim. One tap, one pass, no fuss.',
};

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.rhoddo.app&pcampaignid=web_share';

export default async function Landing() {
  // Signed in: the newest open event fills the hero and the app preview moves below it.
  // Signed out: the hero shows the app preview, and the open events get their own
  // "Happening right now" section under it.
  const [openEvents, buyer] = await Promise.all([loadOpenEvents(), loadSignedInBuyer()]);
  const signedIn = !!buyer;
  const [first, ...moreEvents] = openEvents;
  const event = signedIn ? first : undefined;
  return (
    <div className="theme-site min-h-screen bg-bg text-ink">
      {/* NAV */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-6">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Rhoddo home">
            <Logo className="h-7 w-auto sm:h-10" />
          </Link>
          {/* Section links, only where they fit on one line beside the buttons (laptops up).
              Host sign-in is the "Hosts" button on the right, at every size. */}
          <nav className="hidden items-center gap-8 whitespace-nowrap text-sm text-mute lg:flex">
            <a href="#how" className="transition hover:text-ink">How it works</a>
            {!signedIn && openEvents.length > 0 && (
              <a href="#happening" className="transition hover:text-ink">Happening now</a>
            )}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <AccountLink compact />
            <ThemeToggle />
            <Link
              href="/host/login"
              className="hidden whitespace-nowrap rounded-xl px-3 py-2 text-sm text-mute transition hover:text-ink sm:inline-block"
            >
              Hosts
            </Link>
            <Link
              href="/host/register"
              className="hidden whitespace-nowrap rounded-xl border border-transparent px-3 py-2 text-sm text-mute transition hover:text-ink sm:inline-block"
            >
              List your event
            </Link>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden whitespace-nowrap rounded-xl border border-line px-4 py-2 text-sm text-ink transition hover:border-gold hover:text-gold sm:inline-block"
            >
              Get the app
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background atmosphere — pine + bloom crimson + sunrise gold. Fades in at the
            top so the glows don't leave a hard line under the header. */}
        <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent_0%,black_24%)]">
          <div className="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-pine/30 blur-[140px]" />
          <div className="absolute right-[-120px] top-[-80px] h-[420px] w-[420px] rounded-full bg-gold/15 blur-[140px]" />
          <div className="absolute bottom-[-200px] left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[160px]" />
          {/* Distant ridges across the whole hero */}
          <div className="absolute inset-x-0 bottom-0 h-[62%] bg-[image:var(--art-far)] bg-cover bg-bottom bg-no-repeat opacity-40 md:opacity-70 [mask-image:linear-gradient(to_bottom,transparent_0%,black_30%)]" />
          {/* Keeps the hero text readable over the peaks */}
          <div className="absolute inset-0 [background-image:var(--hero-scrim)]" />
        </div>

        {/* On larger screens the hero fills the first screen below the nav, phone included.
            Phones read it top to bottom: a short intro, the open event, then the actions. */}
        <div className="relative mx-auto flex max-w-6xl flex-col px-5 pb-10 pt-5 sm:px-6 sm:pb-24 sm:pt-10 md:grid md:min-h-[min(calc(100svh-96px),820px)] md:grid-cols-[1.1fr_0.9fr] md:grid-rows-[auto_auto] md:content-center md:items-center md:gap-x-12 md:gap-y-0 md:py-8">
          <div className="relative z-10 min-w-0 md:col-start-1 md:row-start-1 md:self-end">
            <div className="label">Made in Sikkim</div>
            <h1 className="mt-2 font-display text-[2.15rem] leading-[1.05] tracking-[-0.01em] text-ink sm:text-5xl md:mt-3 md:text-6xl lg:text-7xl [@media(min-width:768px)_and_(max-height:820px)]:text-6xl">
              Run the <span className="text-primary">hills</span>
              <br className="hidden md:block" /> of Sikkim.
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-mute sm:mt-6 sm:text-base md:text-lg">
              Races and hands-on workshops across Sikkim. Register in a minute and keep your pass on your phone.
            </p>
          </div>

          <div className="relative z-10 order-3 min-w-0 md:order-none md:col-start-1 md:row-start-2 md:self-start">
            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:flex sm:flex-wrap">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-4 py-3 text-sm sm:px-6 sm:text-base"
              >
                Get the app
              </a>
              <Link href="/host/login" className="btn-ghost border-gold/30 px-4 py-3 text-sm text-gold hover:border-gold sm:px-6 sm:text-base">
                Host an event
              </Link>
            </div>

            <dl className="mt-6 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-panel/70 py-3.5 text-center sm:mt-10 sm:max-w-md md:bg-transparent">
              <div>
                <dd className="font-display text-xl text-ink sm:text-2xl">6</dd>
                <dt className="mt-0.5 text-[10.5px] uppercase tracking-wider text-mute">Districts</dt>
              </div>
              <div>
                <dd className="font-display text-xl text-ink sm:text-2xl">₹0</dd>
                <dt className="mt-0.5 text-[10.5px] uppercase tracking-wider text-mute">Buyer fees</dt>
              </div>
              <div>
                <dd className="font-display text-xl text-gold sm:text-2xl">1 tap</dd>
                <dt className="mt-0.5 text-[10.5px] uppercase tracking-wider text-mute">To your pass</dt>
              </div>
            </dl>
          </div>

          {event ? (
            // The open event: first thing on phones, beside the headline on larger screens.
            <div className="relative order-2 mt-6 flex justify-center md:order-none md:col-start-2 md:row-span-2 md:row-start-1 md:mt-0">
              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(232,184,74,0.18)_0%,transparent_65%)] md:block" />
              <div className="pointer-events-none absolute -bottom-24 left-1/2 hidden h-[760px] w-[1400px] -translate-x-1/2 bg-[image:var(--art-peaks)] bg-contain bg-bottom bg-no-repeat opacity-90 md:block [mask-image:linear-gradient(to_right,transparent_24%,black_36%)]" />
              <div className="relative z-10 flex w-full justify-center [@media(min-width:768px)_and_(max-height:760px)]:[zoom:0.88]">
                <HeroEvent event={event} more={moreEvents} />
              </div>
            </div>
          ) : (
          /* Phone mock, set into the landscape — hidden on mobile, shown on md+ */
          <div className="hidden items-center justify-center md:relative md:col-start-2 md:row-span-2 md:row-start-1 md:flex">
            {/* Sunrise behind the peaks */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(232,184,74,0.18)_0%,transparent_65%)]" />
            {/* Peaks centred on the phone, so it always sits in the valley between them */}
            <div className="pointer-events-none absolute -bottom-24 left-1/2 h-[760px] w-[1400px] -translate-x-1/2 bg-[image:var(--art-peaks)] bg-contain bg-bottom bg-no-repeat opacity-90 [mask-image:linear-gradient(to_right,transparent_24%,black_36%)]" />
            {/* Shrinks on shorter screens so the whole phone fits */}
            <div className="theme-app-light relative z-10 [@media(max-height:900px)]:[zoom:0.88] [@media(max-height:800px)]:[zoom:0.78] [@media(max-height:700px)]:[zoom:0.68]">
              <AppHomeMock />
            </div>
          </div>
          )}
        </div>

      </section>

      {/* The app and its preview phone, when the hero holds an event */}
      {event && <AppShowcase />}

      {/* Visitors who aren't signed in: the open events, below the app preview hero */}
      {!signedIn && <HappeningNow events={openEvents} />}

      {/* FEATURES */}
      <section id="features" className="border-t border-line bg-panel/40">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-24">
          <div className="label">Built for the hills</div>
          <h2 className="mt-2 max-w-2xl font-display text-3xl text-ink sm:text-4xl md:text-5xl">
            Every start line across Sikkim, in one place.
          </h2>

          <div className="mt-8 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3">
            {[
              {
                eyebrow: 'Discover',
                title: 'Races near you, by district',
                body: 'Find marathons, 10Ks, trail runs, cycle climbs, tournaments and workshops by district and date.',
              },
              {
                eyebrow: 'One pass',
                title: 'Register once, race ready',
                body: 'Fill in runner details as you book and get a QR pass for every runner. No paper forms, no queue on race morning.',
              },
              {
                eyebrow: 'Hosted by',
                title: 'Race organisers, clubs and venues',
                body: 'Verified organisers only: running and cycling clubs, sports associations, schools and workshop hosts.',
              },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <div className="text-[11px] uppercase tracking-[0.18em] text-gold">
                  {f.eyebrow}
                </div>
                <div className="mt-3 font-display text-2xl text-ink">{f.title}</div>
                <p className="mt-3 text-sm leading-relaxed text-mute">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-24">
          <div className="label">How it works</div>
          <h2 className="mt-2 max-w-2xl font-display text-3xl text-ink sm:text-4xl md:text-5xl">
            From start line to pass in under a minute.
          </h2>

          <div className="mt-8 grid gap-8 sm:mt-14 sm:gap-10 md:grid-cols-3">
            {[
              { n: '01', t: 'Find', b: 'Open the app and pick a race, a district or a mood. See what\'s on this weekend and this season.' },
              { n: '02', t: 'Register', b: 'Choose your race category, fill in your runner details and pay in INR. Your pass is ready instantly in your Passes tab.' },
              { n: '03', t: 'Show up', b: 'Show your QR at the start or the gate. The organiser scans it and you\'re in. No paper, no faff.' },
            ].map((s) => (
              <div key={s.n}>
                <div className="font-display text-4xl text-gold sm:text-5xl">{s.n}</div>
                <div className="mt-3 font-display text-2xl text-ink">{s.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-mute">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOSTS CTA */}
      <section id="hosts" className="border-t border-line bg-panel/40">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="label">For hosts</div>
              <h2 className="mt-2 max-w-2xl font-display text-3xl text-ink md:text-4xl">
                Organising a race, a tournament or a workshop? List with Rhoddo.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-mute">
                Take registrations, collect participant details with your own form, and
                scan passes on the day, all from the Rhoddo host portal. Payments go
                straight to you and participants pay no fees.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:flex-col md:items-stretch lg:flex-row lg:items-center">
              <Link href="/host/login" className="btn-primary whitespace-nowrap text-center">
                Host sign in
              </Link>
              <Link href="/host/register" className="btn-ghost whitespace-nowrap text-center">
                Apply as a host
              </Link>
              <Link
                href="/host"
                className="text-center text-sm text-mute underline-offset-4 transition hover:text-ink hover:underline"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section id="download" className="relative overflow-hidden border-t border-line">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pine/20 blur-[160px]" />
          <div className="absolute right-10 top-10 h-[260px] w-[260px] rounded-full bg-gold/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-5 py-16 text-center sm:px-6 sm:py-28">
          <div className="label justify-center">Download the app</div>
          {/* Exactly two lines on every screen: each line stays whole, and the size follows the
              screen width (smaller on phones, up to 3.6rem on desktop) so the longer first line
              always fits. */}
          <h2 className="mt-3 whitespace-nowrap font-display text-[clamp(1.15rem,5.3vw,3.6rem)] leading-tight text-ink">
            Sikkim&apos;s races and workshops,
            <br />
            in your pocket.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-mute sm:mt-5 sm:text-base">
            Free to download. Always free to browse. Pay only when you register for a
            race or a workshop.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-line bg-panel px-6 py-4 transition hover:border-gold"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-ink" aria-hidden>
                <path d="M3.6 2.5C3.22 2.85 3 3.4 3 4.1v15.8c0 .7.22 1.25.6 1.6l8.4-9.5L3.6 2.5Zm10.06 9 2.7-3.05L5.55 2.27c-.36-.2-.7-.27-1-.21l9.11 9.44Zm0 1L4.55 21.94c.3.06.64-.01 1-.21l10.81-6.18-2.7-3.05Zm6.5-3.7-3.32-1.9-2.96 3.34 2.96 3.34 3.32-1.9c1.05-.6 1.05-2.27 0-2.88Z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-gold">Get it on</div>
                <div className="font-display text-lg text-ink">Google Play</div>
              </div>
            </a>
          </div>

          <div className="mt-8 text-xs text-mute">
            Android app on Google Play. iPhone app coming soon.
          </div>
        </div>
      </section>

      {/* FOOTER */}
      {/* Phones: logo, then the two link columns side by side, then the credit line.
          Tablets up: logo on the left, the two columns on the right. */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-[1fr_auto_auto] sm:gap-x-16">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-3">
                <Logo className="h-8 w-auto" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-mute">· Sikkim</span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-mute">Races and hands-on workshops across Sikkim.</p>
            </div>
            <nav aria-label="Rhoddo">
              <div className="label">Rhoddo</div>
              <ul className="mt-3 space-y-1 text-sm">
                {[
                  ['/contact', 'Contact'],
                  ['/privacy', 'Privacy'],
                  ['/refund-policy', 'Refunds'],
                  ['/terms', 'Terms'],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="inline-block py-1 text-mute transition hover:text-ink">{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Hosts">
              <div className="label">Hosts</div>
              <ul className="mt-3 space-y-1 text-sm">
                {[
                  ['/host/login', 'Host sign in'],
                  ['/host/register', 'Apply as a host'],
                  ['/host-terms', 'Host Terms'],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="inline-block py-1 text-mute transition hover:text-gold">{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="mt-10 border-t border-line pt-6 text-[11px] text-mute">
            Built by <span className="text-gold">WAGLOGY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
