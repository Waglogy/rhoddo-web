import Link from 'next/link';
import { hostApi } from '@/lib/api';
import { eventWords } from '@/lib/eventWords';
import { RegistrationsTable, type RegistrationsData } from '@/components/RegistrationsTable';

type Props = { params: Promise<{ id: string }> };

export default async function HostRegistrationsPage({ params }: Props) {
  const { id } = await params;
  const data = await hostApi<RegistrationsData>(`/organizer/events/${encodeURIComponent(id)}/registrations`);
  const w = eventWords(data.event.category);

  return (
    <div className="min-w-0">
      <Link href={`/host/events/${id}`} className="text-xs text-mute hover:text-gold">← {data.event.title}</Link>
      <div className="label mt-4">{w.registration ? 'Participants' : 'Attendees'}</div>
      <h1 className="font-display text-4xl text-ink">{w.registration ? 'Registrations' : 'Bookings'}</h1>
      <p className="mt-1 text-sm text-mute">Everyone who signed up, one row per person, with their answers to your form.</p>
      <div className="mt-6">
        <RegistrationsTable data={data} csvHref={`/api/backend/organizer/events/${id}/form-responses.csv`} />
      </div>
    </div>
  );
}
