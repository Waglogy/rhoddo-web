import Link from 'next/link';
import { hostApi } from '@/lib/api';
import { Scanner } from './Scanner';

type Props = { params: Promise<{ id: string }> };

export default async function HostScanEventPage({ params }: Props) {
  const { id } = await params;

  // Load the event so we can show the title in the header and verify ownership.
  // hostApi will throw if the host doesn't own this event — 403 bubbles up.
  const { event } = await hostApi<{ event: { id: string; title: string; date: string } }>(
    `/organizer/events/${id}`,
  );

  // Initial stats — the client component will refresh after each scan.
  const stats = await hostApi<{ total: number; checkedIn: number }>(
    `/tickets/event/${id}/stats`,
  );

  return (
    <div>
      <Link href="/host/events" className="text-xs text-mute hover:text-gold">
        ← Events
      </Link>
      <div className="label mt-4">Gate scanner</div>
      <h1 className="font-display text-4xl text-ink">{event.title}</h1>
      <p className="mt-1 text-sm text-mute">
        Point your camera at the person&apos;s QR. Validation is done by the server —
        the scanner only displays the result.
      </p>

      <div className="mt-8">
        <Scanner eventId={id} initialStats={stats} />
      </div>
    </div>
  );
}
