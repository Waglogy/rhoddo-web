import Link from 'next/link';
import { api } from '@/lib/api';
import { RegistrationsTable, type RegistrationsData } from '@/components/RegistrationsTable';

type Props = { params: Promise<{ id: string }> };

export default async function AdminRegistrationsPage({ params }: Props) {
  const { id } = await params;
  const data = await api<RegistrationsData>(`/admin/events/${encodeURIComponent(id)}/registrations`);

  return (
    <div className="min-w-0">
      <Link href={`/manage-rhoddo/events/${id}`} className="text-xs text-mute hover:text-gold">← {data.event.title}</Link>
      <div className="label mt-4">Event</div>
      <h1 className="font-display text-4xl text-ink">Registrations</h1>
      <p className="mt-1 text-sm text-mute">The same table the host sees: one row per person, with every form answer.</p>
      <div className="mt-6">
        <RegistrationsTable data={data} csvHref={`/api/backend/admin/events/${id}/form-responses.csv`} />
      </div>
    </div>
  );
}
