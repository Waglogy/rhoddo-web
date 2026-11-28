import Link from 'next/link';
import { hostApi } from '@/lib/api';
import { formatDateTime, formatINR } from '@/lib/format';
import { RazorpayDetails } from '@/components/RazorpayDetails';

type Payment = {
  id: string;
  orderNo: string;
  createdAt: string;
  status: string;
  qty: number;
  discount: number;
  total: number;
  platformFeeINR: number;
  payoutINR: number;
  commissionPercent: number | null;
  promoCode: string | null;
  razorpayPaymentId: string | null;
  tierName: string;
  event: { id: string; title: string };
  // Only the contact details the buyer gave for this booking (the API doesn't send hosts
  // the buyer's own account email or user id).
  buyer: { name: string; email: string | null; phone: string | null };
};

type EventRow = {
  eventId: string;
  title: string;
  date: string | null;
  payments: number;
  people: number;
  collectedINR: number;
  rhoddoFeesINR: number;
  hostPayoutINR: number;
};

type Data = {
  payments: Payment[];
  page: number;
  pageSize: number;
  count: number;
  summary: {
    paidCount: number;
    collectedINR: number;
    rhoddoFeesINR: number;
    hostPayoutINR: number;
    discountsINR: number;
    needsRefundCount: number;
    needsRefundINR: number;
    byStatus: Record<string, number>;
  };
  feeBalance: { feesToDateINR: number; paidINR: number; dueINR: number } | null;
  byEvent: EventRow[];
  filters: { events: Array<{ id: string; title: string }> };
};

const STATUS: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Paid', cls: 'bg-pine/15 text-pine' },
  pending: { label: 'Paying now', cls: 'bg-gold/15 text-gold' },
  expired: { label: 'Not completed', cls: 'bg-line text-mute' },
  cancelled: { label: 'Cancelled', cls: 'bg-line text-mute' },
  refunded: { label: 'Refunded', cls: 'bg-line text-ink' },
  needs_refund: { label: 'Needs refund', cls: 'bg-primary/15 text-primary' },
};

const FILTER_KEYS = ['status', 'eventId', 'from', 'to', 'q'] as const;
type Search = Partial<Record<(typeof FILTER_KEYS)[number] | 'page', string>>;

function qs(sp: Search, extra: Search = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...sp, ...extra })) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : '';
}

export default async function HostPaymentsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const raw = await searchParams;
  const sp: Search = {};
  for (const k of [...FILTER_KEYS, 'page'] as const) if (typeof raw[k] === 'string' && raw[k]) sp[k] = raw[k];
  const data = await hostApi<Data>(`/organizer/payments${qs(sp)}`);
  const s = data.summary;
  const fee = data.feeBalance;
  const pages = Math.max(1, Math.ceil(data.count / data.pageSize));
  const filtered = FILTER_KEYS.some((k) => sp[k]);
  const eventTitle = sp.eventId ? data.filters.events.find((e) => e.id === sp.eventId)?.title : null;
  const totals = data.byEvent.reduce(
    (t, e) => ({
      payments: t.payments + e.payments,
      people: t.people + e.people,
      collected: t.collected + e.collectedINR,
      fees: t.fees + e.rhoddoFeesINR,
      payout: t.payout + e.hostPayoutINR,
    }),
    { payments: 0, people: 0, collected: 0, fees: 0, payout: 0 },
  );

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label">Money</div>
          <h1 className="font-display text-4xl text-ink">Payments</h1>
          <p className="mt-1 text-sm text-mute">
            Money people paid you, straight into your Razorpay account, and Rhoddo&apos;s share.
          </p>
        </div>
        <a href={`/api/backend/organizer/payments/export.csv${qs(sp, { page: '' })}`} className="btn-ghost whitespace-nowrap" download>
          Download CSV
        </a>
      </div>

      {/* Totals */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={filtered ? 'Received (filtered)' : 'Received'} value={formatINR(s.collectedINR)} note={`${s.paidCount} paid${s.discountsINR ? ` · ${formatINR(s.discountsINR)} promo discounts` : ''}`} tone="gold" />
        <Stat label="Rhoddo's share" value={formatINR(s.rhoddoFeesINR)} note="Commission on these payments" />
        <Stat label="Your earnings" value={formatINR(s.hostPayoutINR)} note="Received minus Rhoddo's share" />
        {fee ? (
          <Stat
            label="Due to Rhoddo now"
            value={formatINR(fee.dueINR)}
            note={`All events · ${formatINR(fee.feesToDateINR)} total, ${formatINR(fee.paidINR)} paid`}
            tone={fee.dueINR > 0 ? 'primary' : undefined}
            href={fee.dueINR > 0 ? '/host/account' : undefined}
            hrefLabel="How to pay"
          />
        ) : (
          <Stat label="Due to Rhoddo now" value="—" />
        )}
      </div>

      {/* Per event */}
      {data.byEvent.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-2xl text-ink">By event</h2>
          <div className="card mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wider text-mute">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 text-right font-medium">Paid</th>
                  <th className="px-4 py-3 text-right font-medium">People</th>
                  <th className="px-4 py-3 text-right font-medium">Received</th>
                  <th className="px-4 py-3 text-right font-medium">Rhoddo&apos;s share</th>
                  <th className="px-4 py-3 text-right font-medium">Your earnings</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.byEvent.map((e) => (
                  <tr key={e.eventId} className={`border-b border-line last:border-0 ${sp.eventId === e.eventId ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{e.title}</div>
                      {e.date && <div className="text-xs text-mute">{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}</div>}
                    </td>
                    <td className="px-4 py-3 text-right text-ink">{e.payments}</td>
                    <td className="px-4 py-3 text-right text-ink">{e.people}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-ink">{formatINR(e.collectedINR)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-mute">{formatINR(e.rhoddoFeesINR)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-pine">{formatINR(e.hostPayoutINR)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link href={`/host/payments${qs({ eventId: e.eventId })}`} className="text-xs text-primary hover:underline">
                        See payments →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              {data.byEvent.length > 1 && (
                <tfoot>
                  <tr className="border-t border-line font-medium">
                    <td className="px-4 py-3 text-ink">All events</td>
                    <td className="px-4 py-3 text-right text-ink">{totals.payments}</td>
                    <td className="px-4 py-3 text-right text-ink">{totals.people}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-ink">{formatINR(totals.collected)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-mute">{formatINR(totals.fees)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-pine">{formatINR(totals.payout)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink">{eventTitle ? `Payments · ${eventTitle}` : 'All payments'}</h2>
        <form className="card mt-3 grid min-w-0 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5" method="get">
          <select name="eventId" defaultValue={sp.eventId ?? ''} className="input min-w-0 lg:col-span-2">
            <option value="">All events</option>
            {data.filters.events.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <select name="status" defaultValue={sp.status ?? ''} className="input min-w-0">
            <option value="">All statuses</option>
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
                {s.byStatus[k] ? ` (${s.byStatus[k]})` : ''}
              </option>
            ))}
          </select>
          <div className="grid min-w-0 grid-cols-2 gap-2 lg:col-span-2">
            <input type="date" name="from" defaultValue={sp.from} className="input min-w-0" aria-label="From date" />
            <input type="date" name="to" defaultValue={sp.to} className="input min-w-0" aria-label="To date" />
          </div>
          <input name="q" defaultValue={sp.q} placeholder="Name, email, phone, order or payment ID" className="input min-w-0 lg:col-span-3" />
          <div className="flex gap-2 lg:col-span-2 lg:justify-end">
            {filtered && <Link href="/host/payments" className="btn-ghost">Clear</Link>}
            <button type="submit" className="btn-primary px-6">Apply</button>
          </div>
        </form>

        <div className="card mt-4 divide-y divide-line">
          {data.payments.length === 0 && <div className="p-6 text-sm text-mute">No payments yet{filtered ? ' for these filters' : ''}.</div>}
          {data.payments.map((p) => {
            const st = STATUS[p.status] ?? { label: p.status, cls: 'bg-line text-mute' };
            return (
              <div key={p.id} className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${st.cls}`}>{st.label}</span>
                    <span className="text-xs text-mute">{formatDateTime(p.createdAt)}</span>
                  </div>
                  <div className="mt-1.5 truncate text-sm font-medium text-ink">{p.event.title}</div>
                  <div className="truncate text-xs text-mute">{p.tierName} × {p.qty}</div>
                </div>
                <div className="min-w-0 text-sm">
                  <div className="truncate text-ink" title="Account name">{p.buyer.name}</div>
                  <div className="truncate text-xs text-mute">{[p.buyer.email, p.buyer.phone].filter(Boolean).join(' · ') || '—'}</div>
                  <div className="mt-1 font-mono text-[11px] text-mute">
                    {p.orderNo}
                    {p.razorpayPaymentId && <> · {p.razorpayPaymentId}</>}
                  </div>
                  {p.razorpayPaymentId && (
                    <div className="mt-1">
                      <RazorpayDetails bookingId={p.id} area="organizer" />
                    </div>
                  )}
                </div>
                <div className="text-sm lg:text-right">
                  <div className="font-display text-xl text-ink">{formatINR(p.total)}</div>
                  {p.discount > 0 && (
                    <div className="text-xs text-mute">
                      {formatINR(p.discount)} off{p.promoCode ? ` (${p.promoCode})` : ''}
                    </div>
                  )}
                  {p.status === 'confirmed' && (
                    <div className="text-xs text-mute">
                      Rhoddo {formatINR(p.platformFeeINR)}
                      {p.commissionPercent != null ? ` (${p.commissionPercent}%)` : ''} · yours{' '}
                      <span className="text-pine">{formatINR(p.payoutINR)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {pages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="text-mute">
              Page {data.page} of {pages} · {data.count} payments
            </span>
            <div className="flex gap-2">
              {data.page > 1 && (
                <Link className="btn-ghost" href={`/host/payments${qs(sp, { page: String(data.page - 1) })}`}>← Newer</Link>
              )}
              {data.page < pages && (
                <Link className="btn-ghost" href={`/host/payments${qs(sp, { page: String(data.page + 1) })}`}>Older →</Link>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  tone,
  href,
  hrefLabel,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: 'gold' | 'primary';
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="card p-5">
      <div className="label">{label}</div>
      <div className={`mt-1 font-display text-3xl ${tone === 'gold' ? 'text-gold' : tone === 'primary' ? 'text-primary' : 'text-ink'}`}>{value}</div>
      {note && <div className="mt-1 text-xs text-mute">{note}</div>}
      {href && (
        <Link href={href} className="mt-1 inline-block text-xs text-primary hover:underline">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
