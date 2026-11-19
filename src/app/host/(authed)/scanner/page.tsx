import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hostApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { eventWords } from '@/lib/eventWords';

type EventRow = {
  id: string;
  title: string;
  date: string;
  endDate?: string | null;
  district: string;
  category?: string;
  published: boolean;
  venue: { name: string };
};

type Stats = { total: number; checkedIn: number };

/** Live events that are coming up, or finished within the last day (late check-ins). */
function isScannable(e: EventRow, now: number) {
  const oneDay = 24 * 60 * 60 * 1000;
  return e.published && new Date(e.endDate ?? e.date).getTime() >= now - oneDay;
}

export default async function HostScannerPage() {
  const { events } = await hostApi<{ events: EventRow[] }>('/organizer/events');
  const now = Date.now();
  const scannable = events
    .filter((e) => isScannable(e, now))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // With only one event there's nothing to choose, so go straight to the camera.
  if (scannable.length === 1) redirect(`/host/events/${scannable[0].id}/scan`);

  const stats = await Promise.all(
    scannable.map((e) => hostApi<Stats>(`/tickets/event/${e.id}/stats`)),
  );

  return (
    <div>
      <div className="label">At the gate</div>
      <h1 className="font-display text-4xl text-ink">Scanner</h1>
      <p className="mt-1 text-sm text-mute">Choose an event, then scan each guest&apos;s QR code.</p>

      <div className="card mt-8 divide-y divide-line">
        {scannable.length === 0 && (
          <div className="p-6 text-sm text-mute">
            You have no live events to scan.{' '}
            <Link href="/host/events" className="text-gold hover:underline">
              Go to your events
            </Link>
          </div>
        )}
        {scannable.map((e, i) => (
          <div key={e.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0 flex-1 basis-56">
              <div className="truncate text-base text-ink">{e.title}</div>
              <div className="mt-1 text-xs text-mute">
                {e.venue.name} · {e.district} · {formatDate(e.date)}
              </div>
            </div>
            <div className="text-right text-xs text-mute">
              <span className="font-display text-base text-ink">{stats[i].checkedIn}</span> of{' '}
              {stats[i].total} checked in
            </div>
            <Link href={`/host/events/${e.id}/scan`} className="btn-primary whitespace-nowrap">
              Scan {eventWords(e.category).tickets}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
