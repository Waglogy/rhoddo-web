import Link from 'next/link';
import { hostApi } from '@/lib/api';
import { EventForm } from '@/components/EventForm';

export default async function HostNewEventPage() {
  const venuesData = await hostApi<{ venues: Array<{ id: string; name: string }> }>(
    '/organizer/venues',
  );

  return (
    <div>
      <Link href="/host/events" className="text-xs text-mute hover:text-gold">
        ← Events
      </Link>
      <div className="label mt-4">New listing</div>
      <h1 className="font-display text-4xl text-ink">Create event</h1>
      <p className="mt-1 text-sm text-mute">
        Choose one of your venues. You need an approved host account to publish.
      </p>

      {venuesData.venues.length === 0 ? (
        <div className="card mt-10 p-6 text-sm text-mute">
          Add a venue first —{' '}
          <Link href="/host/venues/new" className="text-gold hover:underline">
            Create venue
          </Link>{' '}
          or see{' '}
          <Link href="/host/venues" className="text-gold hover:underline">
            all venues
          </Link>
          .
        </div>
      ) : (
        <div className="mt-10">
          <EventForm venues={venuesData.venues} mode="host" />
        </div>
      )}
    </div>
  );
}
