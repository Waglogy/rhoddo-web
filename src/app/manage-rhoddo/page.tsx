import Link from 'next/link';
import { api } from '@/lib/api';
import { formatINR, formatDate } from '@/lib/format';

type Stats = {
  stats: {
    users: number;
    events: number;
    venues: number;
    bookings: number;
    upcomingEvents: number;
    revenueINR: number;
    organizers: number;
    pendingOrganizers: number;
    platformFeeINR: number;
    feesPaidINR: number;
    feesDueINR: number;
    payoutINR: number;
  };
  recentBookings: Array<{
    id: string;
    orderNo: string;
    total: number;
    qty: number;
    createdAt: string;
    event: { title: string };
  }>;
};

export default async function OverviewPage() {
  const data = await api<Stats>('/admin/stats');
  const s = data.stats;

  const cards = [
    { label: 'Revenue', value: formatINR(s.revenueINR), accent: 'gold' },
    { label: 'Platform fees', value: formatINR(s.platformFeeINR ?? 0), accent: undefined },
    { label: 'Fees paid', value: formatINR(s.feesPaidINR ?? 0), accent: undefined },
    { label: 'Fees due', value: formatINR(s.feesDueINR ?? 0), accent: (s.feesDueINR ?? 0) > 0 ? 'gold' : undefined },
    { label: 'Host earnings', value: formatINR(s.payoutINR ?? 0), accent: undefined },
    { label: 'Bookings', value: s.bookings.toString() },
    { label: 'Events', value: s.events.toString() },
    { label: 'Upcoming', value: s.upcomingEvents.toString() },
    { label: 'Venues', value: s.venues.toString() },
    { label: 'Users', value: s.users.toString() },
    { label: 'Hosts', value: (s.organizers ?? 0).toString(), accent: undefined },
    {
      label: 'Pending hosts',
      value: (s.pendingOrganizers ?? 0).toString(),
      accent: (s.pendingOrganizers ?? 0) > 0 ? ('gold' as const) : undefined,
      href: '/manage-rhoddo/hosts',
    },
  ];

  return (
    <div>
      <div className="label">Dashboard</div>
      <h1 className="font-display text-4xl text-ink">Overview</h1>
      <p className="mt-1 text-sm text-mute">A snapshot of Rhoddo today.</p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cards.map((c) => {
          const inner = (
            <>
              <div className="label">{c.label}</div>
              <div
                className={`mt-2 font-display text-2xl ${
                  c.accent === 'gold' ? 'text-gold' : 'text-ink'
                }`}
              >
                {c.value}
              </div>
            </>
          );
          const key = c.label;
          if ('href' in c && c.href) {
            return (
              <Link key={key} href={c.href} className="card block p-5 transition hover:border-gold/40">
                {inner}
              </Link>
            );
          }
          return (
            <div key={key} className="card p-5">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="mt-12">
        <div className="label">Recent bookings</div>
        <div className="card mt-3 divide-y divide-line">
          {data.recentBookings.length === 0 && (
            <div className="p-6 text-sm text-mute">No bookings yet.</div>
          )}
          {data.recentBookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-5">
              <div>
                <div className="text-sm text-ink">{b.event.title}</div>
                <div className="mt-0.5 text-xs text-mute">
                  {b.orderNo} · {b.qty} ticket{b.qty > 1 ? 's' : ''} · {formatDate(b.createdAt)}
                </div>
              </div>
              <div className="font-display text-lg text-gold">{formatINR(b.total)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
