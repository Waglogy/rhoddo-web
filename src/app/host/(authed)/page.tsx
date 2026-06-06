import Link from 'next/link';
import { hostApi } from '@/lib/api';
import { formatINR, formatDate } from '@/lib/format';

type Stats = {
  stats: {
    venues: number;
    events: number;
    upcomingEvents: number;
    bookings: number;
    grossSalesINR: number;
    platformFeeINR: number;
    payoutINR: number;
    discountGivenINR: number;
    freeTicketsRemaining: number;
    status: string;
  };
  recentBookings: Array<{
    id: string;
    orderNo: string;
    qty: number;
    total: number;
    payoutINR: number;
    platformFeeINR: number;
    createdAt: string;
    event: { title: string };
  }>;
};

export default async function HostDashboard() {
  const data = await hostApi<Stats>('/organizer/stats');
  const s = data.stats;

  return (
    <div>
      <div className="label">Dashboard</div>
      <h1 className="font-display text-4xl text-ink">Welcome back.</h1>
      <p className="mt-1 text-sm text-mute">Here&apos;s how your events are doing.</p>

      {/* Transparency card — the USP, made visible */}
      <div className="mt-10 grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="card relative overflow-hidden p-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold/12 blur-3xl" />
          <div className="label">You&apos;ve kept</div>
          <div className="mt-2 font-display text-5xl text-gold">
            {formatINR(s.payoutINR)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-mute">
                Gross sales
              </div>
              <div className="mt-1 font-display text-lg text-ink">
                {formatINR(s.grossSalesINR)}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-mute">
                Rhoddo fee
              </div>
              <div className="mt-1 font-display text-lg text-ink">
                {formatINR(s.platformFeeINR)}
              </div>
            </div>
            {s.discountGivenINR > 0 && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-mute">
                  Promo discounts given
                </div>
                <div className="mt-1 font-display text-lg text-ink">
                  {formatINR(s.discountGivenINR)}
                </div>
              </div>
            )}
            <div>
              <div className="text-[11px] uppercase tracking-wider text-mute">
                Buyer fees
              </div>
              <div className="mt-1 font-display text-lg text-pine">₹0 · always</div>
            </div>
          </div>
        </div>

        <div className="card p-7">
          <div className="label">Free ticket credit</div>
          <div className="mt-2 font-display text-5xl text-ink">
            {s.freeTicketsRemaining}
          </div>
          <p className="mt-3 text-xs text-mute">
            Tickets you can sell with zero Rhoddo fee. Your launch credit refills
            on request — talk to us when you&apos;re close to running out.
          </p>
        </div>
      </div>

      {/* Counters */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Counter label="Venues" value={s.venues} href="/host/venues" />
        <Counter label="Events" value={s.events} href="/host/events" />
        <Counter label="Upcoming" value={s.upcomingEvents} href="/host/events" />
        <Counter label="Bookings" value={s.bookings} href="/host/bookings" />
      </div>

      {/* Recent bookings */}
      <div className="mt-12">
        <div className="label">Recent bookings</div>
        <div className="card mt-3 divide-y divide-line">
          {data.recentBookings.length === 0 && (
            <div className="p-6 text-sm text-mute">
              No bookings yet. Once buyers book your events, they&apos;ll show up here
              with the exact payout breakdown.
            </div>
          )}
          {data.recentBookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-5">
              <div>
                <div className="text-sm text-ink">{b.event.title}</div>
                <div className="mt-0.5 text-xs text-mute">
                  {b.orderNo} · {b.qty} ticket{b.qty > 1 ? 's' : ''} ·{' '}
                  {formatDate(b.createdAt)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-base text-gold">
                  {formatINR(b.payoutINR)}
                </div>
                <div className="text-[11px] text-mute">
                  fee {formatINR(b.platformFeeINR)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="card block p-5 transition hover:border-gold/50">
      <div className="label">{label}</div>
      <div className="mt-2 font-display text-2xl text-ink">{value}</div>
    </Link>
  );
}
