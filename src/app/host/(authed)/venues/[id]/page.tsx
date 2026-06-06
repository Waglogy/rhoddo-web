import Link from 'next/link';
import { notFound } from 'next/navigation';
import { hostApi } from '@/lib/api';
import { VenueForm } from '@/components/VenueForm';

type Props = { params: Promise<{ id: string }> };

export default async function HostEditVenuePage({ params }: Props) {
  const { id } = await params;

  let data: { venue: Record<string, unknown> };
  try {
    data = await hostApi<{ venue: Record<string, unknown> }>(`/organizer/venues/${id}`);
  } catch {
    notFound();
  }

  return (
    <div>
      <Link href="/host/venues" className="text-xs text-mute hover:text-gold">
        ← Venues
      </Link>
      <div className="label mt-4">Your catalog</div>
      <h1 className="font-display text-4xl text-ink">{String(data.venue.name)}</h1>
      <p className="mt-1 text-sm text-mute">{String(data.venue.address)}</p>

      <div className="mt-10">
        <VenueForm initial={data.venue as any} mode="host" />
      </div>
    </div>
  );
}
