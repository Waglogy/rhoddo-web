import Link from 'next/link';
import { api } from '@/lib/api';
import { EventsClient, type EventRow } from './EventsClient';

export default async function EventsPage() {
  const data = await api<{ events: EventRow[] }>('/admin/events');

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="label">Catalog</div>
          <h1 className="font-display text-4xl text-ink">Events</h1>
          <p className="mt-1 text-sm text-mute">
            Manage every host&apos;s events — pause to hide from the app, publish to make it live,
            or delete permanently.
          </p>
        </div>
        <Link href="/admin/events/new" className="btn-primary">
          + New event
        </Link>
      </div>

      <EventsClient events={data.events} />
    </div>
  );
}
