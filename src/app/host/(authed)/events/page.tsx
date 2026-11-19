import Link from 'next/link';
import { hostApi } from '@/lib/api';
import { formatDate, formatINR } from '@/lib/format';
import { formatPercent } from '@/lib/pricing';
import { EventPublishButton, EventStatusBadge } from '@/components/EventStatus';
import { ShareEventLink } from '@/components/ShareEventLink';
import { getHostMe } from '@/lib/hostMe';
import { eventWords } from '@/lib/eventWords';

type EventRow = {
  id: string;
  title: string;
  slug?: string | null;
  endDate?: string | null;
  category: string;
  district: string;
  date: string;
  priceFromINR: number;
  published: boolean;
  bookingCount: number;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  fees: { feeINR: number; commissionPercent: number };
  venue: { name: string };
};

export default async function HostEventsPage() {
  const [data, me] = await Promise.all([
    hostApi<{ events: EventRow[] }>('/organizer/events'),
    getHostMe(),
  ]);
  const hostApproved = me.organizer.status === 'approved';

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label">Your listings</div>
          <h1 className="font-display text-4xl text-ink">Events</h1>
          <p className="mt-1 text-sm text-mute">Events at your venues only.</p>
        </div>
        <Link href="/host/events/new" className="btn-primary w-full text-center sm:w-auto">
          + New event
        </Link>
      </div>

      <div className="card mt-8 divide-y divide-line">
        {data.events.length === 0 && (
          <div className="p-6 text-sm text-mute">
            No events yet. Create a venue first, then add an event.
          </div>
        )}
        {data.events.map((e) => (
          <div
            key={e.id}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-5 transition hover:bg-bg/40"
          >
            <Link href={`/host/events/${e.id}`} className="min-w-0 flex-1 basis-64">
              <div className="flex items-center gap-2">
                <div className="truncate text-base text-ink">{e.title}</div>
                <EventStatusBadge event={e} />
              </div>
              <div className="mt-1 text-xs text-mute">
                {e.venue.name} · {e.district} · {e.category} · {formatDate(e.date)}
              </div>
            </Link>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="text-right">
                <div className="font-display text-base text-gold">{formatINR(e.priceFromINR)}</div>
                <div className="text-[11px] text-mute">
                  {e.bookingCount} {e.bookingCount === 1 ? eventWords(e.category).booking : eventWords(e.category).bookings} · {formatINR(e.fees.feeINR)} fee
                  {e.reviewStatus === 'approved' && ` · ${formatPercent(e.fees.commissionPercent)}`}
                </div>
              </div>
              {e.published && <ShareEventLink eventId={e.id} slug={e.slug} title={e.title} compact />}
              {e.published && (
                <Link href={`/host/events/${e.id}/scan`} className="btn-ghost whitespace-nowrap">
                  Scan {eventWords(e.category).tickets}
                </Link>
              )}
              <EventPublishButton event={e} hostApproved={hostApproved} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
