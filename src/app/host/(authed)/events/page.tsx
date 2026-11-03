import Link from 'next/link';
import { hostApi } from '@/lib/api';
import { formatDate, formatINR } from '@/lib/format';
import { EventPublishButton, EventStatusBadge } from '@/components/EventStatus';

type EventRow = {
  id: string;
  title: string;
  endDate?: string | null;
  category: string;
  district: string;
  date: string;
  priceFromINR: number;
  published: boolean;
  bookingCount: number;
  culturalStatus: 'pending' | 'approved' | 'rejected';
  fees: { feeINR: number };
  venue: { name: string };
};

export default async function HostEventsPage() {
  const [data, me] = await Promise.all([
    hostApi<{ events: EventRow[] }>('/organizer/events'),
    hostApi<{ organizer: { status: string } }>('/organizer/me'),
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
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="font-display text-base text-gold">{formatINR(e.priceFromINR)}</div>
                <div className="text-[11px] text-mute">
                  {e.bookingCount} bookings · {formatINR(e.fees.feeINR)} fee
                </div>
              </div>
              {e.published && (
                <Link href={`/host/events/${e.id}/scan`} className="btn-ghost whitespace-nowrap">
                  Scan tickets
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
