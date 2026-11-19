import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDateTime, formatINR } from '@/lib/format';
import { RazorpayDetails } from '@/components/RazorpayDetails';

type Payment = {
  id: string;
  orderNo: string;
  createdAt: string;
  status: string;
  qty: number;
  subtotal: number;
  discount: number;
  total: number;
  platformFeeINR: number;
  payoutINR: number;
  commissionPercent: number | null;
  promoCode: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  tierName: string;
  event: { id: string; title: string };
  host: { id: string; name: string } | null;
  buyer: { id: string; name: string; email: string | null; phone: string | null };
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
    refundedINR: number;
    unfinishedCount: number;
    byStatus: Record<string, number>;
  };
  filters: { events: Array<{ id: string; title: string }>; hosts: Array<{ id: string; name: string }> };
};

const STATUS: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Paid', cls: 'bg-pine/15 text-pine' },
  pending: { label: 'Paying now', cls: 'bg-gold/15 text-gold' },
  expired: { label: 'Not completed', cls: 'bg-line text-mute' },
  cancelled: { label: 'Cancelled', cls: 'bg-line text-mute' },
  refunded: { label: 'Refunded', cls: 'bg-line text-ink' },
  needs_refund: { label: 'Needs refund', cls: 'bg-primary/15 text-primary' },
};

const FILTER_KEYS = ['status', 'eventId', 'hostId', 'from', 'to', 'q', 'free'] as const;
type Search = Partial<Record<(typeof FILTER_KEYS)[number] | 'page', string>>;

function queryString(sp: Search, extra: Search = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...sp, ...extra })) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : '';
}

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const raw = await searchParams;
  const sp: Search = {};
  for (const k of [...FILTER_KEYS, 'page'] as const) if (typeof raw[k] === 'string' && raw[k]) sp[k] = raw[k];
  const data = await api<Data>(`/admin/payments${queryString(sp)}`);
  const s = data.summary;
  const pages = Math.max(1, Math.ceil(data.count / data.pageSize));
  const filtered = FILTER_KEYS.some((k) => sp[k]);

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label">Money</div>
          <h1 className="font-display text-4xl text-ink">Payments</h1>
          <p className="mt-1 text-sm text-mute">
            Every payment buyers made, straight into each host&apos;s Razorpay account. {filtered ? 'Totals follow the filters.' : ''}
          </p>
        </div>
        <a href={`/api/backend/admin/payments/export.csv${queryString(sp, { page: '' })}`} className="btn-ghost whitespace-nowrap" download>
          Download CSV
        </a>
      </div>

      {/* Totals */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Collected" value={formatINR(s.collectedINR)} note={`${s.paidCount} paid`} tone="gold" />
        <Stat label="Rhoddo fees" value={formatINR(s.rhoddoFeesINR)} note="Owed by hosts" />
        <Stat label="Host payouts" value={formatINR(s.hostPayoutINR)} note={s.discountsINR ? `After ${formatINR(s.discountsINR)} promo discounts` : 'Paid to hosts by Razorpay'} />
        <Stat
          label="Needs refund"
          value={formatINR(s.needsRefundINR)}
          note={s.needsRefundCount ? `${s.needsRefundCount} to refund from the host's Razorpay` : `${formatINR(s.refundedINR)} refunded so far`}
          tone={s.needsRefundCount ? 'primary' : undefined}
        />
      </div>

      {/* Filters (a plain form, so they live in the URL and can be shared) */}
      <form className="card mt-6 grid min-w-0 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6" method="get">
        <input name="q" defaultValue={sp.q} placeholder="Order, payment ID, email, phone, name" className="input min-w-0 lg:col-span-2" />
        <select name="status" defaultValue={sp.status ?? ''} className="input min-w-0">
          <option value="">All statuses</option>
          {Object.entries(STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
              {s.byStatus[k] ? ` (${s.byStatus[k]})` : ''}
            </option>
          ))}
        </select>
        <select name="eventId" defaultValue={sp.eventId ?? ''} className="input min-w-0">
          <option value="">All events</option>
          {data.filters.events.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
        <select name="hostId" defaultValue={sp.hostId ?? ''} className="input min-w-0">
          <option value="">All hosts</option>
          {data.filters.hosts.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <input type="date" name="from" defaultValue={sp.from} className="input min-w-0" aria-label="From date" />
          <input type="date" name="to" defaultValue={sp.to} className="input min-w-0" aria-label="To date" />
        </div>
        <label className="flex items-center gap-2 text-sm text-mute lg:col-span-2">
          <input type="checkbox" name="free" value="1" defaultChecked={sp.free === '1'} />
          Include free registrations
        </label>
        <div className="flex gap-2 lg:col-span-4 lg:justify-end">
          {filtered && (
            <Link href="/manage-rhoddo/payments" className="btn-ghost">Clear</Link>
          )}
          <button type="submit" className="btn-primary px-6">Apply</button>
        </div>
      </form>

      {/* List */}
      <div className="card mt-6 divide-y divide-line">
        {data.payments.length === 0 && <div className="p-6 text-sm text-mute">No payments match.</div>}
        {data.payments.map((p) => {
          const st = STATUS[p.status] ?? { label: p.status, cls: 'bg-line text-mute' };
          return (
            <div key={p.id} className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${st.cls}`}>{st.label}</span>
                  <span className="text-xs text-mute">{formatDateTime(p.createdAt)}</span>
                </div>
                <div className="mt-1.5 truncate text-sm font-medium text-ink">{p.event.title}</div>
                <div className="truncate text-xs text-mute">
                  {p.tierName} × {p.qty} · {p.host?.name ?? 'Rhoddo venue'}
                </div>
              </div>

              <div className="min-w-0 text-sm">
                <div className="truncate text-ink">{p.buyer.name}</div>
                <div className="truncate text-xs text-mute">{[p.buyer.email, p.buyer.phone].filter(Boolean).join(' · ') || '—'}</div>
                <div className="mt-1 font-mono text-[11px] text-mute">
                  {p.orderNo}
                  {p.razorpayPaymentId && <> · {p.razorpayPaymentId}</>}
                </div>
                {p.razorpayPaymentId && (
                  <div className="mt-1">
                    <RazorpayDetails bookingId={p.id} />
                  </div>
                )}
              </div>

              <div className="text-sm lg:text-right">
                <div className="font-display text-xl text-ink">{p.total > 0 ? formatINR(p.total) : 'Free'}</div>
                {p.discount > 0 && (
                  <div className="text-xs text-mute">
                    {formatINR(p.discount)} off{p.promoCode ? ` (${p.promoCode})` : ''}
                  </div>
                )}
                {p.status === 'confirmed' && p.total > 0 && (
                  <div className="text-xs text-mute">
                    Rhoddo {formatINR(p.platformFeeINR)}
                    {p.commissionPercent != null ? ` (${p.commissionPercent}%)` : ''} · host {formatINR(p.payoutINR)}
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
              <Link className="btn-ghost" href={`/manage-rhoddo/payments${queryString(sp, { page: String(data.page - 1) })}`}>
                ← Newer
              </Link>
            )}
            {data.page < pages && (
              <Link className="btn-ghost" href={`/manage-rhoddo/payments${queryString(sp, { page: String(data.page + 1) })}`}>
                Older →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: 'gold' | 'primary' }) {
  return (
    <div className="card p-5">
      <div className="label">{label}</div>
      <div className={`mt-1 font-display text-3xl ${tone === 'gold' ? 'text-gold' : tone === 'primary' ? 'text-primary' : 'text-ink'}`}>{value}</div>
      {note && <div className="mt-1 text-xs text-mute">{note}</div>}
    </div>
  );
}
