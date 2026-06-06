import Link from 'next/link';
import { requireHostToken } from '@/lib/auth';
import { hostApi } from '@/lib/api';
import { HostLogoutButton } from '@/components/HostLogoutButton';

const NAV = [
  { href: '/host', label: 'Dashboard' },
  { href: '/host/venues', label: 'Venues' },
  { href: '/host/events', label: 'Events' },
  { href: '/host/bookings', label: 'Bookings' },
  { href: '/host/account', label: 'Account' },
];

type Me = {
  organizer: {
    businessName: string;
    name: string;
    email: string;
    status: 'pending' | 'approved' | 'suspended';
    freeTicketsRemaining: number;
  };
};

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  await requireHostToken();
  const me = await hostApi<Me>('/organizer/me');

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-line bg-bg p-6 md:block">
        <Link href="/host" className="block">
          <div className="label">Rhoddo</div>
          <div className="font-display text-2xl text-ink">Host</div>
        </Link>

        <div className="mt-8 rounded-xl border border-line bg-panel p-3">
          <div className="text-[11px] uppercase tracking-wider text-mute">Signed in as</div>
          <div className="mt-1 truncate text-sm text-ink">{me.organizer.businessName}</div>
          <div className="mt-0.5 truncate text-[11px] text-mute">{me.organizer.email}</div>
          <StatusPill status={me.organizer.status} />
        </div>

        <nav className="mt-8 space-y-1">
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
          <HostLogoutButton />
        </div>
      </aside>

      <main className="flex-1 px-6 py-10 md:px-12">
        {me.organizer.status === 'pending' && <PendingBanner />}
        {me.organizer.status === 'suspended' && <SuspendedBanner />}
        {children}
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: 'pending' | 'approved' | 'suspended' }) {
  const map = {
    approved: { label: 'Approved', cls: 'border-pine/60 text-pine bg-pine/10' },
    pending: { label: 'Pending review', cls: 'border-gold/60 text-gold bg-gold/10' },
    suspended: { label: 'Suspended', cls: 'border-primary/60 text-primary bg-primary/10' },
  } as const;
  const v = map[status];
  return (
    <span
      className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

function PendingBanner() {
  return (
    <div className="mb-8 rounded-2xl border border-gold/40 bg-gold/10 p-5">
      <div className="text-[11px] uppercase tracking-wider text-gold">Awaiting approval</div>
      <div className="mt-1 font-display text-xl text-ink">
        Your application is being reviewed.
      </div>
      <p className="mt-1 text-sm text-mute">
        You can browse the dashboard and prepare your venues, but you can&apos;t
        publish or sell tickets until a Rhoddo admin approves your account. We
        usually review within two working days.
      </p>
    </div>
  );
}

function SuspendedBanner() {
  return (
    <div className="mb-8 rounded-2xl border border-primary/40 bg-primary/10 p-5">
      <div className="text-[11px] uppercase tracking-wider text-primary">Account suspended</div>
      <div className="mt-1 font-display text-xl text-ink">
        This account is currently suspended.
      </div>
      <p className="mt-1 text-sm text-mute">
        Contact Rhoddo support to restore access.
      </p>
    </div>
  );
}
