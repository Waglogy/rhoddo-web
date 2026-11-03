import { hostApi } from '@/lib/api';
import { formatDate, formatINR } from '@/lib/format';
import { HostAccountForm, type OrganizerProfile } from '@/components/HostAccountForm';
import { HostPaymentsCard } from '@/components/HostPaymentsCard';

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

type HostFees = {
  feesToDateINR: number;
  paidINR: number;
  dueINR: number;
  payments: Array<{ id: string; amountINR: number; note: string | null; paidAt: string }>;
};

function FeeFigure({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-mute">{label}</div>
      <div className={`mt-1 font-display text-lg ${highlight ? 'text-gold' : 'text-ink'}`}>
        {formatINR(value)}
      </div>
    </div>
  );
}

export default async function HostAccountPage() {
  const [data, fees] = await Promise.all([
    hostApi<{ organizer: OrganizerProfile }>('/organizer/me'),
    hostApi<HostFees>('/organizer/fees'),
  ]);
  const o = data.organizer;

  return (
    <div>
      <div className="label">Settings</div>
      <h1 className="font-display text-4xl text-ink">Account</h1>
      <p className="mt-1 text-sm text-mute">Your business profile.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card p-5">
          <div className="label">Status</div>
          <div className="mt-2">
            <StatusPill status={o.status} />
          </div>
        </div>
        <div className="card p-5">
          <div className="label">Phone</div>
          <div className={`mt-2 text-sm ${o.phoneVerified ? 'text-pine' : 'text-gold'}`}>
            {o.phoneVerified ? 'Verified' : 'Not verified'}
          </div>
          {o.phone && <div className="mt-1 truncate text-[11px] text-mute">{o.phone}</div>}
        </div>
        <div className="card p-5">
          <div className="label">Free tickets</div>
          <div className="mt-2 font-display text-2xl text-gold">{o.freeTicketsRemaining}</div>
          <div className="mt-1 text-[11px] text-mute">Remaining, with no Rhoddo fee</div>
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

      <HostPaymentsCard payments={o.payments} />

      <div className="card mt-8 p-6">
        <h2 className="font-display text-xl text-ink">Rhoddo fees</h2>
        <div className="mt-5 grid grid-cols-3 gap-4">
          <FeeFigure label="Fees to date" value={fees.feesToDateINR} />
          <FeeFigure label="Paid" value={fees.paidINR} />
          <FeeFigure label="Due" value={fees.dueINR} highlight={fees.dueINR > 0} />
        </div>
        <p className="mt-4 text-xs text-mute">
          {fees.dueINR > 0 ? (
            <>
              To pay, email{' '}
              <a href="mailto:support@rhoddo.com" className="text-gold hover:underline">
                support@rhoddo.com
              </a>{' '}
              and we&apos;ll send you the payment details. Payments can take a little while to
              appear here.
            </>
          ) : (
            'Nothing to pay right now.'
          )}
        </p>
        {fees.payments.length > 0 && (
          <div className="mt-5 divide-y divide-line border-t border-line">
            {fees.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0 text-mute">
                  {formatDate(p.paidAt)}
                  {p.note && <span className="block truncate text-xs">{p.note}</span>}
                </div>
                <div className="shrink-0 text-ink">{formatINR(p.amountINR)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <HostAccountForm organizer={o} />
      </div>
    </div>
  );
}
