import Link from 'next/link';
import { api, fetchCategoryOptions } from '@/lib/api';
import { EventForm } from '@/components/EventForm';
import { RegistrationFormPreview } from '@/components/RegistrationFormPreview';

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const [eventData, venuesData, categories] = await Promise.all([
    api<{ event: any }>(`/admin/events/${id}`),
    api<{ venues: Array<{ id: string; name: string }> }>('/admin/venues'),
    fetchCategoryOptions(),
  ]);

  return (
    <div>
      <div className="label">Catalog · Edit</div>
      <h1 className="font-display text-4xl text-ink">{eventData.event.title}</h1>
      <p className="mt-1 text-sm text-mute">Update or unpublish.</p>
      <Link href={`/manage-rhoddo/events/${id}/registrations`} className="btn-ghost mt-4 inline-flex">
        View all registrations (table)
      </Link>

      {eventData.event.form && (
        <div className="mt-10">
          <RegistrationFormPreview
            form={eventData.event.form}
            csvHref={`/api/backend/admin/events/${id}/form-responses.csv`}
          />
        </div>
      )}

      <div className="mt-10">
        <EventForm venues={venuesData.venues} categories={categories} initial={eventData.event} />
      </div>
    </div>
  );
}
