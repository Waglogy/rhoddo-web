import Link from 'next/link';
import { fetchCategoryOptions, hostApi } from '@/lib/api';
import { EventForm } from '@/components/EventForm';
import { EventFeeCard, type EventFees } from '@/components/EventFeeCard';
import { EventPublishButton, EventStatusBadge } from '@/components/EventStatus';

type Props = { params: Promise<{ id: string }> };

export default async function HostEditEventPage({ params }: Props) {
  const { id } = await params;
  const me = await hostApi<{ organizer: { status: string } }>('/organizer/me');
  const draftOnly = me.organizer.status !== 'approved';
  const [eventData, venuesData, categories] = await Promise.all([
    hostApi<{ event: Record<string, unknown> }>(`/organizer/events/${id}`),
    hostApi<{ venues: Array<{ id: string; name: string }> }>('/organizer/venues'),
    fetchCategoryOptions(),
  ]);

  return (
    <div>
      <Link href="/host/events" className="text-xs text-mute hover:text-gold">
        ← Events
      </Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="label">Edit listing</div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl text-ink">{String(eventData.event.title)}</h1>
            <EventStatusBadge event={eventData.event as any} />
          </div>
          <p className="mt-1 text-sm text-mute">Update your event details.</p>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <EventPublishButton event={eventData.event as any} hostApproved={!draftOnly} />
          <Link
            href={`/host/events/${id}/scan`}
            className="btn-ghost inline-flex items-center gap-2 whitespace-nowrap"
          >
            Open gate scanner
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <EventFeeCard fees={eventData.event.fees as EventFees} />
      </div>

      <div className="mt-8">
        <EventForm
          venues={venuesData.venues}
          categories={categories}
          initial={eventData.event as any}
          mode="host"
          draftOnly={draftOnly}
        />
      </div>
    </div>
  );
}
