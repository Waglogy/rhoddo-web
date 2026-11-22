import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LEGAL_LINKS } from '@/components/LegalShell';
import { AccountLink } from './AccountLink';

/** Plain page frame for the runner's sign-in and account pages. */
export function AccountShell({ children, showAccount = false }: { children: React.ReactNode; showAccount?: boolean }) {
  return (
    <div className="theme-site flex min-h-screen flex-col bg-bg text-ink">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" aria-label="Rhoddo home">
          <Logo className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          {showAccount && <AccountLink />}
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-16 pt-4 sm:px-6">{children}</main>
      <footer className="border-t border-line">
        <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-6 text-xs text-mute">
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
