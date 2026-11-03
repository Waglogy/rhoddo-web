import { hostApi } from '@/lib/api';
import { formatINR, formatDateTime } from '@/lib/format';
import { includesEarlierTickets } from '@/lib/pricing';

type Booking = {
  id: string;
  orderNo: string;
  qty: number;
  total: number;
  platformFeeINR: number;
  status: string;
  createdAt: string;
  event?: { title: string; venue?: { name: string } };
  user?: { name: string; email: string };
};

export default async function HostBookingsPage() {
  const data = await hostApi<{ bookings: Booking[] }>('/organizer/bookings');

  return (
    <div>
      <div className="label">Your sales</div>
      <h1 className="font-display text-4xl text-ink">Bookings</h1>
      <p className="mt-1 text-sm text-mute">
        Bookings for events at your venues (latest 200).
      </p>

      <div className="card mt-8 divide-y divide-line">
        {data.bookings.length === 0 && (
          <div className="p-6 text-sm text-mute">No bookings yet.</div>
        )}
        {data.bookings.map((b) => (
          <div key={b.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-ink">{b.event?.title ?? 'Event'}</div>
              <div className="mt-0.5 text-xs text-mute">
                {b.event?.venue?.name && <>{b.event.venue.name} · </>}
                {b.orderNo} · {b.qty} ticket{b.qty > 1 ? 's' : ''} · {formatDateTime(b.createdAt)}
              </div>
              {b.user && (
                <div className="mt-1 text-xs text-mute">
                  {b.user.name} · {b.user.email}
                </div>
              )}
              <div className="mt-1 text-[10px] uppercase tracking-wider text-mute">{b.status}</div>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
              <div className="font-display text-base text-gold">{formatINR(b.total)}</div>
              <div className="text-xs text-mute">
                Rhoddo fee {formatINR(b.platformFeeINR ?? 0)}
                {includesEarlierTickets(b.qty, b.platformFeeINR ?? 0) && ' · includes earlier tickets'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
