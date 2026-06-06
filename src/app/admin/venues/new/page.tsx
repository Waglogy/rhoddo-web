import { VenueForm } from '@/components/VenueForm';

export default function NewVenuePage() {
  return (
    <div>
      <div className="label">Catalog · New</div>
      <h1 className="font-display text-4xl text-ink">Create venue</h1>
      <p className="mt-1 text-sm text-mute">Restaurants, resorts, halls, monasteries.</p>

      <div className="mt-10">
        <VenueForm />
      </div>
    </div>
  );
}
