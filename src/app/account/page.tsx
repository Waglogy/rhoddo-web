import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { USER_COOKIE } from '@/lib/auth';
import { formatINR } from '@/lib/format';
import { formatWhen } from '@/lib/publicEvent';
import { PLACEHOLDER_NAME, type Buyer } from '@/lib/buyerApi';
import { AccountShell } from '@/components/account/AccountShell';
import { SignOutButton } from '@/components/account/SignOutButton';
import { SupportNote } from '@/components/SupportNote';

export const metadata: Metadata = { title: 'My account · Rhoddo', robots: { index: false } };

type Booking = {
  id: string;
  orderNo: string;
  qty: number;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  tierId: string;
  createdAt: string;
  paymentId?: string | null;
  event?: {
    id: string;
    slug?: string | null;
    title: string;
    date: string;
    category?: string;
    venue?: { name: string } | null;
    tiers: Array<{ id: string; name: string }>;
  };
  tickets: Array<{ checkedIn: boolean }>;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Paid · confirmed', cls: 'bg-pine/15 text-pine' },
  cancelled: { label: 'Cancelled', cls: 'bg-line text-mute' },
  refunded: { label: 'Refunded', cls: 'bg-line text-ink' },
  needs_refund: { label: 'Refund due', cls: 'bg-primary/15 text-primary' },
};

async function load(token: string) {
  const headers = { Authorization: `Bearer ${token}` };
  const [me, bookings] = await Promise.all([
    fetch(`${API_URL}/me`, { headers, cache: 'no-store' }),
    fetch(`${API_URL}/bookings/me`, { headers, cache: 'no-store' }),
  ]);
  if (me.status === 401 || bookings.status === 401) return null;
  if (!me.ok || !bookings.ok) throw new Error('Could not load your account');
  return {
    user: ((await me.json()) as { user: Buyer }).user,
    bookings: ((await bookings.json()) as { bookings: Booking[] }).bookings,
  };
}

// rhoddo.com/account: the runner's registrations, payments and passes.
export default async function AccountPage() {
  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (!token) redirect('/signin?next=/account');
  const data = await load(token);
  if (!data) redirect('/api/buyer/session-expired');
  const { user, bookings } = data;
  if (!user.termsAccepted || !user.name || user.name === PLACEHOLDER_NAME) redirect('/signin?next=/account');

  const now = Date.now();
  const upcoming = bookings.filter((b) => b.event && new Date(b.event.date).getTime() >= now - 864e5);
  const past = bookings.filter((b) => !upcoming.includes(b));
  const paid = bookings.filter((b) => b.status === 'confirmed').reduce((sum, b) => sum + b.total, 0);

  return (
    <AccountShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label">My account</div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">{user.name}</h1>
          <p className="mt-1 text-sm text-mute">{user.email ?? user.phone}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="card p-4">
          <div className="label">Registrations</div>
          <div className="font-display text-2xl text-ink">{bookings.length}</div>
        </div>
        <div className="card p-4">
          <div className="label">Paid</div>
          <div className="font-display text-2xl text-ink">{formatINR(paid)}</div>
        </div>
      </div>

      <Section title="Upcoming" bookings={upcoming} empty="No upcoming registrations yet." />
      {past.length > 0 && <Section title="Past" bookings={past} />}

      <div className="mt-10 space-y-4 border-t border-line pt-6 text-sm text-mute">
        <p>
          Your registrations are also in the Rhoddo app under <span className="text-ink">Passes</span>, when you sign in
          with the same email or Google account.
        </p>
        <SupportNote context="my Rhoddo account" />
        <p>
          <Link href="/me" className="text-xs underline hover:text-ink">
            Delete my account
          </Link>
        </p>
      </div>
    </AccountShell>
  );
}

function Section({ title, bookings, empty }: { title: string; bookings: Booking[]; empty?: string }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      {bookings.length === 0 ? (
        <p className="mt-3 text-sm text-mute">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {bookings.map((b) => (
            <BookingCard key={b.id} b={b} />
          ))}
        </ul>
      )}
    </section>
  );
}

function BookingCard({ b }: { b: Booking }) {
  const st =
    b.status === 'confirmed' && b.total <= 0
      ? { label: 'Confirmed', cls: STATUS.confirmed.cls }
      : STATUS[b.status] ?? { label: b.status, cls: 'bg-line text-mute' };
  const pass = b.event?.tiers.find((t) => t.id === b.tierId)?.name ?? 'Pass';
  const scanned = b.tickets.filter((t) => t.checkedIn).length;
  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${st.cls}`}>{st.label}</span>
          <h3 className="mt-2 font-display text-xl text-ink">
            {b.event ? (
              <Link href={b.event.slug ? `/r/${b.event.slug}` : `/event/${b.event.id}`} className="hover:underline">
                {b.event.title}
              </Link>
            ) : (
              'Event'
            )}
          </h3>
          {b.event && (
            <p className="text-sm text-mute">
              {formatWhen(b.event.date)}
              {b.event.venue?.name ? ` · ${b.event.venue.name}` : ''}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="font-display text-2xl text-ink">{b.total > 0 ? formatINR(b.total) : 'Free'}</div>
          {b.discount > 0 && <div className="text-xs text-mute">{formatINR(b.discount)} off</div>}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <Item label="Pass" value={`${pass} × ${b.qty}`} />
        <Item label="Registered" value={new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })} />
        <Item label="Order" value={b.orderNo} mono />
        {b.paymentId ? <Item label="Payment ID" value={b.paymentId} mono /> : <Item label="Payment" value={b.total > 0 ? '—' : 'Not needed'} />}
      </dl>

      {b.status === 'confirmed' && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href={`/ticket/${b.id}`} className="btn-primary px-5 py-2.5 text-sm">
            View {b.qty > 1 ? `${b.qty} passes` : 'pass'}
          </Link>
          {scanned > 0 && <span className="text-xs text-mute">{scanned} checked in</span>}
        </div>
      )}
    </li>
  );
}

function Item({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wider text-mute">{label}</dt>
      <dd className={`truncate text-ink ${mono ? 'font-mono text-xs leading-5' : ''}`}>{value}</dd>
    </div>
  );
}
