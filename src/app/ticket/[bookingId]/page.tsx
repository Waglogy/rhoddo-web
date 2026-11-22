import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Logo } from '@/components/Logo';
import { API_URL } from '@/lib/api';
import { USER_COOKIE } from '@/lib/auth';
import { formatINR } from '@/lib/format';
import { formatPlace, formatWhen } from '@/lib/publicEvent';
import { SupportNote } from '@/components/SupportNote';

// A buyer's passes after registering on the website. The same passes are in the
// app's Passes tab and the confirmation email; the QR codes are the ticket codes
// hosts scan, exactly as the app shows them.

export const metadata: Metadata = { title: 'Your pass · Rhoddo', robots: { index: false } };

type Props = { params: Promise<{ bookingId: string }> };

type Booking = {
  id: string;
  orderNo: string;
  qty: number;
  total: number;
  status: string;
  tierId: string;
  event: {
    title: string;
    date: string;
    district: string;
    venue?: { name: string } | null;
    tiers: Array<{ id: string; name: string }>;
  };
  tickets: Array<{ id: string; code: string; checkedIn: boolean }>;
};

type Lookup = { booking: Booking } | { problem: 'signed-out' | 'missing' | 'unavailable' };

async function loadBooking(id: string): Promise<Lookup> {
  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (!token) return { problem: 'signed-out' };
  try {
    const res = await fetch(`${API_URL}/bookings/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.status === 401) return { problem: 'signed-out' };
    if (res.status === 404) return { problem: 'missing' };
    if (!res.ok) return { problem: 'unavailable' };
    return { booking: ((await res.json()) as { booking: Booking }).booking };
  } catch {
    return { problem: 'unavailable' };
  }
}

export default async function TicketPage({ params }: Props) {
  const { bookingId } = await params;
  const result = await loadBooking(bookingId);

  return (
    <div className="theme-site min-h-screen bg-bg text-ink">
      <div className="mx-auto max-w-lg px-4 py-6">
        <Link href="/" className="inline-block" aria-label="Rhoddo home">
          <Logo className="h-8 w-auto" />
        </Link>
        {'booking' in result ? <Passes booking={result.booking} /> : <Problem problem={result.problem} bookingId={bookingId} />}
        {'booking' in result && (
          <Link href="/account" className="mt-6 block text-center text-sm text-mute underline hover:text-ink">
            All my registrations and payments
          </Link>
        )}
        <SupportNote context="my Rhoddo pass" className="mt-6" />
      </div>
    </div>
  );
}

async function Passes({ booking }: { booking: Booking }) {
  const tierName = booking.event.tiers.find((t) => t.id === booking.tierId)?.name ?? 'Pass';
  const confirmed = booking.status === 'confirmed';
  const codes = confirmed
    ? await Promise.all(
        booking.tickets.map(async (t) => ({
          ...t,
          svg: await QRCode.toString(t.code, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' }),
        })),
      )
    : [];

  return (
    <div className="mt-6 space-y-5">
      {confirmed ? (
        <div className="rounded-2xl border border-pine/30 bg-pine/10 px-4 py-3 text-sm text-ink">
          <div className="font-medium">You&apos;re registered.</div>
          <div className="mt-0.5 text-mute">
            Show {codes.length > 1 ? 'these passes' : 'this pass'} at entry. We&apos;ve also emailed{' '}
            {codes.length > 1 ? 'them' : 'it'} to you.
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
          We&apos;re confirming your payment. This usually takes a minute. Refresh this page, or check your email
          shortly.
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="border-b border-line p-5">
          <div className="label">{tierName}</div>
          <h1 className="mt-1 font-display text-2xl text-ink">{booking.event.title}</h1>
          <p className="mt-1 text-sm text-mute">{formatWhen(booking.event.date)}</p>
          <p className="text-sm text-mute">{formatPlace(booking.event)}</p>
        </div>
        {codes.map((t, i) => (
          <div key={t.id} className="flex flex-col items-center border-b border-dashed border-line p-6 last:border-b-0">
            {codes.length > 1 && (
              <div className="mb-3 text-sm font-medium text-gold">
                Pass {i + 1} of {codes.length}
              </div>
            )}
            {/* Always dark on white, so scanners can read it in either theme. */}
            <div
              className="w-56 rounded-2xl bg-white p-3 [&>svg]:h-auto [&>svg]:w-full"
              role="img"
              aria-label={`QR code for ticket ${t.code}`}
              dangerouslySetInnerHTML={{ __html: t.svg }}
            />
            <div className="mt-3 font-mono text-sm tracking-wider text-ink">{t.code}</div>
            {t.checkedIn && <div className="mt-1 text-xs text-mute">Checked in</div>}
          </div>
        ))}
        <div className="flex justify-between bg-bg/60 px-5 py-3 text-xs text-mute">
          <span>Order {booking.orderNo}</span>
          <span>{booking.total > 0 ? `Paid ${formatINR(booking.total)}` : 'Free'}</span>
        </div>
      </div>
    </div>
  );
}

function Problem({ problem, bookingId }: { problem: 'signed-out' | 'missing' | 'unavailable'; bookingId: string }) {
  const text = {
    'signed-out': 'Sign in with the account you registered with to see your pass. It is also in your email.',
    missing: 'We couldn’t find this pass on your account.',
    unavailable: 'We couldn’t load your pass. Please try again in a moment.',
  }[problem];
  return (
    <div className="card mt-6 p-6">
      <h1 className="font-display text-2xl text-ink">Your pass</h1>
      <p className="mt-2 text-sm text-mute">{text}</p>
      {problem === 'signed-out' && (
        <Link href={`/signin?next=${encodeURIComponent(`/ticket/${bookingId}`)}`} className="btn-primary mt-4 inline-block">
          Sign in
        </Link>
      )}
    </div>
  );
}
