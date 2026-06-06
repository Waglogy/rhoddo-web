import { api } from '@/lib/api';
import { EventForm } from '@/components/EventForm';

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const [eventData, venuesData] = await Promise.all([
    api<{ event: any }>(`/admin/events/${id}`),
    api<{ venues: Array<{ id: string; name: string }> }>('/admin/venues'),
  ]);

  return (
    <div>
      <div className="label">Catalog · Edit</div>
      <h1 className="font-display text-4xl text-ink">{eventData.event.title}</h1>
      <p className="mt-1 text-sm text-mute">Update or unpublish.</p>

      <div className="mt-10">
        <EventForm venues={venuesData.venues} initial={eventData.event} />
      </div>
    </div>
  );
}
