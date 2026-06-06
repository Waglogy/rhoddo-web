import { api } from '@/lib/api';
import { EventForm } from '@/components/EventForm';

export default async function NewEventPage() {
  const venuesData = await api<{ venues: Array<{ id: string; name: string }> }>('/admin/venues');

  return (
    <div>
      <div className="label">Catalog · New</div>
      <h1 className="font-display text-4xl text-ink">Create event</h1>
      <p className="mt-1 text-sm text-mute">Fill in the details below to publish.</p>

      <div className="mt-10">
        <EventForm venues={venuesData.venues} />
      </div>
    </div>
  );
}
