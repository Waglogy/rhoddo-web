import { api } from '@/lib/api';
import { VenueForm } from '@/components/VenueForm';

type Props = { params: Promise<{ id: string }> };

export default async function EditVenuePage({ params }: Props) {
  const { id } = await params;
  // Reuse the public route — venue + its upcoming events
  const data = await api<{ venue: any }>(`/venues/${id}`);

  return (
    <div>
      <div className="label">Catalog · Edit</div>
      <h1 className="font-display text-4xl text-ink">{data.venue.name}</h1>
      <p className="mt-1 text-sm text-mute">{data.venue.address}</p>

      <div className="mt-10">
        <VenueForm initial={data.venue} />
      </div>
    </div>
  );
}
