import Link from 'next/link';
import { VenueForm } from '@/components/VenueForm';

export default function HostNewVenuePage() {
  return (
    <div>
      <Link href="/host/venues" className="text-xs text-mute hover:text-gold">
        ← Venues
      </Link>
      <div className="label mt-4">Your catalog</div>
      <h1 className="font-display text-4xl text-ink">Create venue</h1>
      <p className="mt-1 text-sm text-mute">
        Restaurants, resorts, halls, monasteries. You need an approved account to save.
      </p>

      <div className="mt-10">
        <VenueForm mode="host" />
      </div>
    </div>
  );
}
