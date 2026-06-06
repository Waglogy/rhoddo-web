import Link from 'next/link';
import { hostApi } from '@/lib/api';
import { formatDate, formatINR } from '@/lib/format';

type EventRow = {
  id: string;
  title: string;
  category: string;
  district: string;
  date: string;
  priceFromINR: number;
  published: boolean;
  bookingCount: number;
  venue: { name: string };
};

export default async function HostEventsPage() {
  const data = await hostApi<{ events: EventRow[] }>('/organizer/events');

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
          <Link
            key={e.id}
            href={`/host/events/${e.id}`}
            className="flex items-center justify-between gap-6 p-5 transition hover:bg-bg/40"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate text-base text-ink">{e.title}</div>
                {!e.published && (
                  <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-mute">
                    Draft
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-mute">
                {e.venue.name} · {e.district} · {e.category} · {formatDate(e.date)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-base text-gold">{formatINR(e.priceFromINR)}</div>
              <div className="text-[11px] text-mute">{e.bookingCount} bookings</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
