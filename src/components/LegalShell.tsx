import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

export const LEGAL_LINKS = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/refund-policy', label: 'Refunds' },
  { href: '/contact', label: 'Contact' },
];

/** Header + footer shared by the legal and help pages. */
export function LegalShell({ label, title, updated, children }: { label: string; title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="theme-site min-h-screen bg-bg text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-auto sm:h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/" className="text-sm text-mute transition hover:text-ink">
              Back to home
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="label">{label}</div>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{title}</h1>
        {updated && <p className="mt-4 text-sm text-mute">Last updated: {updated}</p>}
        <div className="mt-12 space-y-10 text-sm leading-relaxed text-mute">{children}</div>
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">
          <Logo className="h-8 w-auto" />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mute">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="text-center text-[11px] text-mute md:text-right">
            Built by <span className="text-gold">WAGLOGY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
