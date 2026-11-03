import Link from 'next/link';
import { hostApi } from '@/lib/api';
import { VenueForm } from '@/components/VenueForm';

export default async function HostNewVenuePage() {
  const me = await hostApi<{ organizer: { status: string } }>('/organizer/me');
  const draftOnly = me.organizer.status !== 'approved';

  return (
    <div>
      <Link href="/host/venues" className="text-xs text-mute hover:text-gold">
        ← Venues
      </Link>
      <div className="label mt-4">Your catalog</div>
      <h1 className="font-display text-4xl text-ink">Create venue</h1>
      <p className="mt-1 text-sm text-mute">
        Restaurants, resorts, halls, monasteries.
        {draftOnly && ' It stays private until your account is approved.'}
      </p>

      <div className="mt-10">
        <VenueForm mode="host" draftOnly={draftOnly} />
      </div>
    </div>
  );
}
