import Link from 'next/link';
import { hostApi } from '@/lib/api';

type VenueRow = {
  id: string;
  name: string;
  kind: string;
  district: string;
  rating: number;
  eventCount: number;
};

export default async function HostVenuesPage() {
  const data = await hostApi<{ venues: VenueRow[] }>('/organizer/venues');

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="label">Your catalog</div>
          <h1 className="font-display text-4xl text-ink">Venues</h1>
          <p className="mt-1 text-sm text-mute">
            The places where your events happen. Add as many as you like.
          </p>
        </div>
        <Link href="/host/venues/new" className="btn-primary">
          + New venue
        </Link>
      </div>

      <div className="card mt-8 divide-y divide-line">
        {data.venues.length === 0 && (
          <div className="p-6 text-sm text-mute">
            No venues yet. Add one to start creating events.
          </div>
        )}
        {data.venues.map((v) => (
          <Link
            key={v.id}
            href={`/host/venues/${v.id}`}
            className="flex items-center justify-between p-5 transition hover:bg-bg/40"
          >
            <div>
              <div className="text-base text-ink">{v.name}</div>
              <div className="mt-1 text-xs text-mute">
                {v.kind} · {v.district} · ★ {v.rating.toFixed(1)}
              </div>
            </div>
            <div className="text-xs text-mute">{v.eventCount} events</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
