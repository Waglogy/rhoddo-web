import Link from 'next/link';
import { requireAdminToken } from '@/lib/auth';
import { LogoutButton } from '@/components/LogoutButton';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/hosts', label: 'Hosts' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/venues', label: 'Venues' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/notifications', label: 'Notifications' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdminToken();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-line bg-bg p-6 md:block">
        <Link href="/admin" className="block">
          <div className="label">Rhoddo</div>
          <div className="font-display text-2xl text-ink">Admin</div>
        </Link>

        <nav className="mt-10 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-xl px-4 py-2.5 text-sm text-mute transition hover:bg-panel hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="mt-12">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 px-6 py-10 md:px-12">{children}</main>
    </div>
  );
}
