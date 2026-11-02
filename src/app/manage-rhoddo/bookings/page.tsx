import { api } from '@/lib/api';
import { formatINR, formatDateTime } from '@/lib/format';

type Booking = {
  id: string;
  orderNo: string;
  qty: number;
  total: number;
  createdAt: string;
  event: { title: string; venue: { name: string } };
};

export default async function BookingsPage() {
  const data = await api<{ bookings: Booking[] }>('/admin/bookings');

  return (
    <div>
      <div className="label">Sales</div>
      <h1 className="font-display text-4xl text-ink">Bookings</h1>
      <p className="mt-1 text-sm text-mute">Latest 100 bookings.</p>

      <div className="card mt-8 divide-y divide-line">
        {data.bookings.length === 0 && (
          <div className="p-6 text-sm text-mute">No bookings yet.</div>
        )}
        {data.bookings.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-6 p-5">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-ink">{b.event.title}</div>
              <div className="mt-0.5 text-xs text-mute">
                {b.orderNo} · {b.event.venue.name} · {b.qty} ticket{b.qty > 1 ? 's' : ''} · {formatDateTime(b.createdAt)}
              </div>
            </div>
            <div className="font-display text-base text-gold">{formatINR(b.total)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
