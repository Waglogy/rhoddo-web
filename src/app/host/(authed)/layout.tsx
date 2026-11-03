import Link from 'next/link';
import { requireHostToken } from '@/lib/auth';
import { hostApi } from '@/lib/api';
import { HostLogoutButton } from '@/components/HostLogoutButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HostPhoneVerify } from '@/components/HostPhoneVerify';

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
    phone: string | null;
    phoneVerified: boolean;
    status: 'pending' | 'approved' | 'suspended';
    freeTicketsRemaining: number;
    payments: { connected: boolean };
  };
};

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  await requireHostToken();
  const me = await hostApi<Me>('/organizer/me');
  const suspended = me.organizer.status === 'suspended';

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-line bg-bg p-6 md:block">
        <div className="flex items-start justify-between gap-2">
          <Link href="/host" className="block">
            <div className="label">Rhoddo</div>
            <div className="font-display text-2xl text-ink">Host</div>
          </Link>
          <ThemeToggle />
        </div>

        <div className="mt-8 rounded-xl border border-line bg-panel p-3">
          <div className="text-[11px] uppercase tracking-wider text-mute">Signed in as</div>
          <div className="mt-1 truncate text-sm text-ink">{me.organizer.businessName}</div>
          <div className="mt-0.5 truncate text-[11px] text-mute">{me.organizer.email}</div>
          <StatusPill status={me.organizer.status} />
        </div>

        {!suspended && <nav className="mt-8 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-xl px-4 py-2.5 text-sm text-mute transition hover:bg-panel hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>}

        <div className="mt-12">
          <HostLogoutButton />
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-6 py-6 md:px-12 md:py-10">
        {/* The sidebar is hidden on phones */}
        <div className="mb-6 md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/host" className="font-display text-xl text-ink">Rhoddo Host</Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="w-28"><HostLogoutButton /></div>
            </div>
          </div>
          {!suspended && (
            <nav className="no-scrollbar -mx-6 mt-4 flex gap-2 overflow-x-auto px-6" aria-label="Host menu">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="shrink-0 rounded-xl border border-line px-3 py-2 text-xs text-mute transition hover:text-ink"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {suspended ? (
          <SuspendedBanner />
        ) : (
          <>
            {!me.organizer.phoneVerified && <HostPhoneVerify initialPhone={me.organizer.phone} />}
            {me.organizer.status === 'pending' && me.organizer.phoneVerified && <PendingBanner />}
            {me.organizer.status === 'approved' && !me.organizer.payments.connected && <ConnectPaymentsBanner />}
            {children}
          </>
        )}
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

function ConnectPaymentsBanner() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-gold/10 p-5">
      <div>
        <div className="text-sm font-medium text-ink">Connect Razorpay to sell paid tickets</div>
        <p className="mt-1 text-sm text-mute">Buyers pay directly into your own account. Free events work without it.</p>
      </div>
      <Link href="/host/account#payments" className="btn-primary whitespace-nowrap">
        Add your keys
      </Link>
    </div>
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
        You can add venues and events as drafts now. Once a Rhoddo admin approves your
        account, you can publish them and sell tickets. We usually review within two
        working days.
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
