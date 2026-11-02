import { api } from '@/lib/api';
import { HostsClient } from './HostsClient';
import type { OrganizerRow } from './types';

export default async function AdminHostsPage() {
  const data = await api<{ organizers: OrganizerRow[] }>('/admin/organizers');
  const pending = data.organizers.filter((o) => o.status === 'pending').length;

  return (
    <div>
      <div className="label">Operations</div>
      <h1 className="font-display text-4xl text-ink">Hosts</h1>
      <p className="mt-1 text-sm text-mute">
        Approve organizer accounts, suspend bad actors, and adjust launch free-ticket credits.
      </p>
      {pending > 0 && (
        <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
          <span className="font-medium text-gold">{pending}</span> application{pending !== 1 ? 's' : ''}{' '}
          awaiting approval.
        </div>
      )}

      <HostsClient organizers={data.organizers} />
    </div>
  );
}
