import Link from 'next/link';
import { api } from '@/lib/api';

type VenueRow = {
  id: string;
  name: string;
  kind: string;
  district: string;
  rating: number;
  eventCount: number;
};

export default async function VenuesPage() {
  const data = await api<{ venues: VenueRow[] }>('/admin/venues');

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="label">Catalog</div>
          <h1 className="font-display text-4xl text-ink">Venues</h1>
        </div>
        <Link href="/manage-rhoddo/venues/new" className="btn-primary">
          + New venue
        </Link>
      </div>

      <div className="card mt-8 divide-y divide-line">
        {data.venues.length === 0 && (
          <div className="p-6 text-sm text-mute">No venues yet.</div>
        )}
        {data.venues.map((v) => (
          <Link
            key={v.id}
            href={`/manage-rhoddo/venues/${v.id}`}
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
