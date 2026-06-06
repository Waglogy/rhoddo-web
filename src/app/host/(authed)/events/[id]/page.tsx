import Link from 'next/link';
import { hostApi } from '@/lib/api';
import { EventForm } from '@/components/EventForm';

type Props = { params: Promise<{ id: string }> };

export default async function HostEditEventPage({ params }: Props) {
  const { id } = await params;
  const [eventData, venuesData] = await Promise.all([
    hostApi<{ event: Record<string, unknown> }>(`/organizer/events/${id}`),
    hostApi<{ venues: Array<{ id: string; name: string }> }>('/organizer/venues'),
  ]);

  return (
    <div>
      <Link href="/host/events" className="text-xs text-mute hover:text-gold">
        ← Events
      </Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="label">Edit listing</div>
          <h1 className="font-display text-4xl text-ink">{String(eventData.event.title)}</h1>
          <p className="mt-1 text-sm text-mute">Update details or unpublish.</p>
        </div>
        <Link
          href={`/host/events/${id}/scan`}
          className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
        >
          Open gate scanner
        </Link>
      </div>

      <div className="mt-10">
        <EventForm
          venues={venuesData.venues}
          initial={eventData.event as any}
          mode="host"
        />
      </div>
    </div>
  );
}
