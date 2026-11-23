import Link from 'next/link';
import { Logo } from '@/components/Logo';
import type { Metadata } from 'next';
import { AppHomeMock } from '@/components/AppHomeMock';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccountLink } from '@/components/account/AccountLink';
import { AppShowcase, HeroEvent, loadOpenEvents } from '@/components/FeaturedEvent';

export const metadata: Metadata = {
  title: 'Rhoddo — Races & events across Sikkim',
  description:
    'Register for marathons, trail runs, cycle races, tournaments and hands-on workshops across Sikkim. One tap, one pass, no fuss.',
};

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.rhoddo.app&pcampaignid=web_share';

export default async function Landing() {
  // The newest event open for registration fills the hero; the app preview moves below it.
  const [event, ...moreEvents] = await loadOpenEvents();
  return (
    <div className="theme-site min-h-screen bg-bg text-ink">
      {/* NAV */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-auto sm:h-10" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-mute md:flex">
            <a href="#features" className="transition hover:text-ink">Features</a>
            <a href="#how" className="transition hover:text-ink">How it works</a>
            <a href="#hosts" className="transition hover:text-ink">For hosts</a>
            <Link href="/host/login" className="transition hover:text-ink">
              Host sign in
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <AccountLink compact />
            <ThemeToggle />
            <Link
              href="/host/login"
              className="hidden rounded-xl px-3 py-2 text-sm text-mute transition hover:text-ink sm:inline-block md:hidden"
            >
              Hosts
            </Link>
            <Link
              href="/host/register"
              className="hidden rounded-xl border border-transparent px-3 py-2 text-sm text-mute transition hover:text-ink sm:inline-block"
            >
              List your event
            </Link>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-xl border border-line px-3 py-2 text-sm text-ink transition hover:border-gold hover:text-gold sm:px-4"
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

        {/* On larger screens the hero fills the first screen below the nav, phone included. */}
        <div className="relative mx-auto flex max-w-6xl flex-col px-5 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10 md:grid md:min-h-[min(calc(100svh-96px),820px)] md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-12 md:py-8">
          <div className="relative z-10 flex min-w-0 flex-col justify-center text-center md:text-left">
            <div className="label flex justify-center md:justify-start">Made in Sikkim</div>
            <h1 className="mt-3 font-display text-[2.25rem] leading-[1.08] text-ink sm:text-5xl md:text-6xl lg:text-7xl [@media(min-width:768px)_and_(max-height:820px)]:text-6xl">
              Run the
              <br />
              <span className="text-primary">hills</span> of
              <br />
              Sikkim.
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-mute sm:mt-6 sm:text-base md:text-lg">
              Marathons, trail runs, cycle races and tournaments across Sikkim,
              plus hands-on workshops. Register, fill in your details and get your
              pass in one tap.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                ↓ Download app
              </a>
              <Link href="/host/login" className="btn-ghost border-gold/30 text-gold hover:border-gold">
                Host portal →
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-mute sm:mt-10 sm:gap-6 md:justify-start">
              <div>
                <div className="font-display text-xl text-ink sm:text-2xl">6</div>
                <div className="mt-0.5 uppercase tracking-wider">Districts</div>
              </div>
              <div className="h-8 w-px bg-line" />
              <div>
                <div className="font-display text-xl text-ink sm:text-2xl">₹0</div>
                <div className="mt-0.5 uppercase tracking-wider">Buyer fees</div>
              </div>
              <div className="h-8 w-px bg-line" />
              <div>
                <div className="font-display text-xl text-gold sm:text-2xl">1 tap</div>
                <div className="mt-0.5 uppercase tracking-wider">To pass</div>
              </div>
            </div>
          </div>

          {event ? (
            // The open event: first thing on phones, beside the headline on larger screens.
            <div className="relative order-first mb-10 flex justify-center md:order-none md:mb-0">
              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(232,184,74,0.18)_0%,transparent_65%)] md:block" />
              <div className="pointer-events-none absolute -bottom-24 left-1/2 hidden h-[760px] w-[1400px] -translate-x-1/2 bg-[image:var(--art-peaks)] bg-contain bg-bottom bg-no-repeat opacity-90 md:block [mask-image:linear-gradient(to_right,transparent_24%,black_36%)]" />
              <div className="relative z-10 flex w-full justify-center [@media(min-width:768px)_and_(max-height:760px)]:[zoom:0.88]">
                <HeroEvent event={event} more={moreEvents} />
              </div>
            </div>
          ) : (
          /* Phone mock, set into the landscape — hidden on mobile, shown on md+ */
          <div className="hidden items-center justify-center md:relative md:flex">
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

      {/* FEATURES */}
      <section id="features" className="border-t border-line bg-panel/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="label">Built for the hills</div>
          <h2 className="mt-2 max-w-2xl font-display text-4xl text-ink md:text-5xl">
            Every start line across Sikkim, in one place.
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
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
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="label">How it works</div>
          <h2 className="mt-2 max-w-2xl font-display text-4xl text-ink md:text-5xl">
            From start line to pass in under a minute.
          </h2>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              { n: '01', t: 'Find', b: 'Open the app and pick a race, a district or a mood. See what\'s on this weekend and this season.' },
              { n: '02', t: 'Register', b: 'Choose your race category, fill in your runner details and pay in INR. Your pass is ready instantly in your Passes tab.' },
              { n: '03', t: 'Show up', b: 'Show your QR at the start or the gate. The organiser scans it and you\'re in. No paper, no faff.' },
            ].map((s) => (
              <div key={s.n}>
                <div className="font-display text-5xl text-gold">{s.n}</div>
                <div className="mt-3 font-display text-2xl text-ink">{s.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-mute">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOSTS CTA */}
      <section id="hosts" className="border-t border-line bg-panel/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
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

        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <div className="label justify-center">Download the app</div>
          <h2 className="mt-3 font-display text-5xl leading-tight text-ink md:text-6xl">
            Sikkim&apos;s races and workshops,
            <br />
            in your pocket.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-mute">
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
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-mute">
              · Sikkim
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mute md:justify-start">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-ink">Refunds</Link>
            <Link href="/contact" className="hover:text-ink">Contact</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/host-terms" className="hover:text-ink">Host Terms</Link>
            <a href="#" className="hover:text-ink">Contact</a>
            <Link href="/host/login" className="hover:text-gold">Host sign in</Link>
            <Link href="/host/register" className="hover:text-gold">Apply as a host</Link>
          </div>
          <div className="text-center text-[11px] text-mute md:text-right">
            Built by <span className="text-gold">WAGLOGY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
