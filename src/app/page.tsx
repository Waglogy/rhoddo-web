import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rhoddo — Sikkim Events, in your pocket',
  description:
    'Discover concerts, monastery festivals, resort dinners and cultural nights across Sikkim. One tap, one pass, no fuss.',
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* NAV */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl text-ink">Rhoddo</span>
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-mute md:inline">
              · Sikkim
            </span>
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
            <Link
              href="/host/login"
              className="rounded-xl px-3 py-2 text-sm text-mute transition hover:text-ink md:hidden"
            >
              Hosts
            </Link>
            <Link
              href="/host/register"
              className="hidden rounded-xl border border-transparent px-3 py-2 text-sm text-mute transition hover:text-ink sm:inline-block"
            >
              List your venue
            </Link>
            <Link
              href="#download"
              className="rounded-xl border border-line px-4 py-2 text-sm text-ink transition hover:border-gold hover:text-gold"
            >
              Get the app
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background atmosphere — pine + bloom crimson + sunrise gold */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-pine/30 blur-[140px]" />
          <div className="absolute right-[-120px] top-[-80px] h-[420px] w-[420px] rounded-full bg-gold/15 blur-[140px]" />
          <div className="absolute bottom-[-200px] left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/15 blur-[160px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 md:grid md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:pt-24">
          <div className="flex min-w-0 flex-col justify-center text-center md:text-left">
            <div className="label flex justify-center md:justify-start">Made in Sikkim</div>
            <h1 className="mt-3 font-display text-[2.25rem] leading-[1.08] text-ink sm:text-5xl md:text-7xl">
              Catch the
              <br />
              <span className="text-gold">bloom</span> before
              <br />
              it fades.
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-mute sm:mt-6 sm:text-base md:text-lg">
              Like the rhododendrons that paint Sikkim&apos;s hillsides every season,
              the best events don&apos;t wait. Rhoddo brings you every concert, festival,
              resort dinner, and mountain gathering — before they&apos;re gone.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
              <Link href="#download" className="btn-primary">
                ↓ Download app
              </Link>
              <a href="#features" className="btn-ghost">
                See what&apos;s inside
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

          {/* Phone mocks — hidden on mobile, shown on md+ */}
          <div className="hidden items-center justify-center md:relative md:flex">
            <div className="relative flex items-center">
              {/* iOS phone — back, tilted left */}
              <div className="relative -mr-8 aspect-[9/19.5] w-[232px] -rotate-[6deg] rounded-[44px] border border-line bg-panel p-2 shadow-card">
                <div className="absolute left-1/2 top-2.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-[#111]" />
                <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#FFFCF2]">
                  <Image
                    src="/landing-ios.jpg"
                    alt="Rhoddo iOS app screenshot"
                    fill
                    sizes="232px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-panel px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-mute">
                  iOS
                </div>
              </div>

              {/* Android phone — front, tilted right */}
              <div className="relative z-10 aspect-[9/19.5] w-[248px] rotate-[5deg] rounded-[36px] border border-line bg-panel p-2 shadow-card">
                <div className="absolute left-1/2 top-3 z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#111]" />
                <div className="relative h-full w-full overflow-hidden rounded-[30px] bg-[#0E1512]">
                  <Image
                    src="/landing-android.jpg"
                    alt="Rhoddo Android app screenshot"
                    fill
                    sizes="248px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-panel px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-mute">
                  Android
                </div>
              </div>
            </div>

            {/* glow accent behind phones */}
            <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
              <div className="h-[460px] w-[440px] rounded-full bg-gold/10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-line bg-panel/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="label">Built for the hills</div>
          <h2 className="mt-2 max-w-2xl font-display text-4xl text-ink md:text-5xl">
            Every bloom across Sikkim, in one place.
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                eyebrow: 'Discover',
                title: 'By district, not by algorithm',
                body: 'Browse what\'s blooming near you — by district and by mood. Sunrise hikes, pine-lit dinners, hilltop concerts, seasonal festivals.',
              },
              {
                eyebrow: 'One pass',
                title: 'Tap, scan, walk in',
                body: 'A single QR pass per booking. No PDFs, no waiting in line, no scrambling at the gate.',
              },
              {
                eyebrow: 'Hosted by',
                title: 'Resorts, restaurants, monasteries',
                body: 'Verified hosts only — Mayfair, Mantram, Rumtek, Yangsum and the small places worth knowing.',
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
            From browse to pass in under a minute.
          </h2>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              { n: '01', t: 'Browse', b: 'Open the app, pick a district or a mood. See what\'s on tonight, this weekend, this season.' },
              { n: '02', t: 'Book', b: 'Choose your tier, pay in INR. Your pass is created instantly and lives in your Tickets tab.' },
              { n: '03', t: 'Walk in', b: 'Show your QR at the gate. The host scans it, you\'re in. No paper, no faff.' },
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
                Run a venue or a festival? List with Rhoddo.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-mute">
                Resorts, restaurants, monasteries and event organizers across Sikkim
                use the Rhoddo host portal to manage events, tiers and bookings —
                with payouts in INR, no commissions on cultural events.
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
            Sikkim&apos;s best nights,
            <br />
            in your pocket.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-mute">
            Free to download. Always free to browse. Pay only when you book a seat,
            a pass, or a table.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <div className="group flex items-center gap-3 rounded-2xl border border-line bg-panel px-6 py-4 opacity-60">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-ink" aria-hidden>
                <path d="M16.365 1.43c0 1.14-.42 2.23-1.18 3.04-.81.86-2.13 1.52-3.22 1.43-.13-1.1.43-2.25 1.16-3 .82-.84 2.21-1.46 3.24-1.47ZM20.5 17.45c-.55 1.27-.81 1.84-1.52 2.96-.99 1.55-2.39 3.49-4.13 3.51-1.55.02-1.95-1-4.05-1-2.1.01-2.54 1.02-4.09 1-1.74-.02-3.07-1.77-4.06-3.32C-.13 17.43-.4 12.36 1.5 9.66c1.34-1.92 3.46-3.05 5.45-3.05 2.03 0 3.31 1.11 4.99 1.11 1.63 0 2.62-1.11 4.97-1.11 1.78 0 3.66.97 5 2.65-4.4 2.41-3.68 8.7-1.41 8.19Z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-gold">Coming soon</div>
                <div className="font-display text-lg text-ink">App Store</div>
              </div>
            </div>

            <div className="group flex items-center gap-3 rounded-2xl border border-line bg-panel px-6 py-4 opacity-60">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-ink" aria-hidden>
                <path d="M3.6 2.5C3.22 2.85 3 3.4 3 4.1v15.8c0 .7.22 1.25.6 1.6l8.4-9.5L3.6 2.5Zm10.06 9 2.7-3.05L5.55 2.27c-.36-.2-.7-.27-1-.21l9.11 9.44Zm0 1L4.55 21.94c.3.06.64-.01 1-.21l10.81-6.18-2.7-3.05Zm6.5-3.7-3.32-1.9-2.96 3.34 2.96 3.34 3.32-1.9c1.05-.6 1.05-2.27 0-2.88Z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-gold">Coming soon</div>
                <div className="font-display text-lg text-ink">Google Play</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-mute">
            Launching soon on iOS and Android. Stay tuned.
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-ink">Rhoddo</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-mute">
              · Sikkim
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mute md:justify-start">
            <a href="#" className="hover:text-ink">Privacy</a>
            <a href="#" className="hover:text-ink">Terms</a>
            <a href="#" className="hover:text-ink">Contact</a>
            <Link href="/host/login" className="hover:text-gold">Host sign in</Link>
            <Link href="/host/register" className="hover:text-gold">Apply as a host</Link>
            <Link href="/login" className="hover:text-ink">Staff admin</Link>
          </div>
          <div className="text-center text-[11px] text-mute md:text-right">
            Built by <span className="text-gold">WAGLOGY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
