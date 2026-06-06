import { hostApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { HostAccountForm, type OrganizerProfile } from '@/components/HostAccountForm';

function StatusPill({ status }: { status: OrganizerProfile['status'] }) {
  const map = {
    approved: { label: 'Approved', cls: 'border-pine/60 text-pine bg-pine/10' },
    pending: { label: 'Pending review', cls: 'border-gold/60 text-gold bg-gold/10' },
    suspended: { label: 'Suspended', cls: 'border-primary/60 text-primary bg-primary/10' },
  } as const;
  const v = map[status];
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

export default async function HostAccountPage() {
  const data = await hostApi<{ organizer: OrganizerProfile }>('/organizer/me');
  const o = data.organizer;

  return (
    <div>
      <div className="label">Settings</div>
      <h1 className="font-display text-4xl text-ink">Account</h1>
      <p className="mt-1 text-sm text-mute">Business profile and payout details.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="label">Status</div>
          <div className="mt-2">
            <StatusPill status={o.status} />
          </div>
        </div>
        <div className="card p-5">
          <div className="label">Free ticket credit</div>
          <div className="mt-2 font-display text-2xl text-gold">{o.freeTicketsRemaining}</div>
          <div className="mt-1 text-[11px] text-mute">Launch promo tickets remaining</div>
        </div>
        <div className="card p-5">
          <div className="label">Joined</div>
          <div className="mt-2 text-sm text-ink">{formatDate(o.createdAt)}</div>
        </div>
        <div className="card p-5">
          <div className="label">Approved</div>
          <div className="mt-2 text-sm text-ink">
            {o.approvedAt ? formatDate(o.approvedAt) : '—'}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <HostAccountForm organizer={o} />
      </div>
    </div>
  );
}
