import Link from 'next/link';
import { hostApi } from '@/lib/api';
import { formatINR, formatDate } from '@/lib/format';
import { formatPercent } from '@/lib/pricing';
import { HostGuideVideo } from '@/components/HostGuideVideo';

type Stats = {
  stats: {
    venues: number;
    events: number;
    upcomingEvents: number;
    bookings: number;
    grossSalesINR: number;
    platformFeeINR: number;
    feesPaidINR: number;
    feesDueINR: number;
    discountGivenINR: number;
    commissionPercent: number | null;
    status: string;
  };
  recentBookings: Array<{
    id: string;
    orderNo: string;
    qty: number;
    total: number;
    payoutINR: number;
    platformFeeINR: number;
    commissionPercent: number | null;
    createdAt: string;
    event: { title: string };
  }>;
};

export default async function HostDashboard({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const data = await hostApi<Stats>('/organizer/stats');
  const s = data.stats;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label">Dashboard</div>
          <h1 className="font-display text-4xl text-ink">Welcome back.</h1>
          <p className="mt-1 text-sm text-mute">Here&apos;s how your events are doing.</p>
        </div>
        <Link href="/host/scanner" className="btn-primary w-full text-center sm:w-auto">
          Scan tickets
        </Link>
      </div>

      <HostGuideVideo openOnLoad={welcome === '1'} />

      {/* Transparency card — the USP, made visible */}
      <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="card relative overflow-hidden p-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold/12 blur-3xl" />
          <div className="label">Ticket sales</div>
          <div className="mt-2 font-display text-5xl text-gold">
            {formatINR(s.grossSalesINR)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-mute">
                Rhoddo fees to date
              </div>
              <div className="mt-1 font-display text-lg text-ink">
                {formatINR(s.platformFeeINR)}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-mute">
                Paid to Rhoddo
              </div>
              <div className="mt-1 font-display text-lg text-ink">
                {formatINR(s.feesPaidINR)}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-mute">
                Fee due
              </div>
              <div className={`mt-1 font-display text-lg ${s.feesDueINR > 0 ? 'text-gold' : 'text-ink'}`}>
                {formatINR(s.feesDueINR)}
              </div>
              {s.feesDueINR > 0 && (
                <Link href="/host/account" className="mt-0.5 block text-[11px] text-mute underline hover:text-ink">
                  How to pay
                </Link>
              )}
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
          <div className="label">Your Rhoddo commission</div>
          <div className="mt-2 font-display text-5xl text-ink">
            {s.commissionPercent === null ? '—' : formatPercent(s.commissionPercent)}
          </div>
          <p className="mt-3 text-xs text-mute">
            {s.commissionPercent === null
              ? 'Rhoddo sets your commission when it approves your account.'
              : 'Rhoddo’s share of each booking. Each event is reviewed once, and its rate is shown on the event.'}{' '}
            Buyers never pay a fee.
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
              with any Rhoddo fee.
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
                  {formatINR(b.total)}
                </div>
                <div className="text-[11px] text-mute">
                  Rhoddo fee {formatINR(b.platformFeeINR)}
                  {b.commissionPercent !== null && ` · ${formatPercent(b.commissionPercent)}`}
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
