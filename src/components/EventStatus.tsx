"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/client-api';

type EventState = {
  id: string;
  title: string;
  date: string;
  endDate?: string | null;
  published: boolean;
  category: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
};

const PILL = 'whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider';

function hasEnded(e: EventState) {
  return new Date(e.endDate ?? e.date).getTime() < Date.now();
}

export function EventStatusBadge({ event }: { event: EventState }) {
  if (event.reviewStatus === 'pending') {
    return <span className={`${PILL} border-gold/60 bg-gold/10 text-gold`}>In review</span>;
  }
  if (event.reviewStatus === 'rejected') {
    return <span className={`${PILL} border-primary/60 bg-primary/10 text-primary`}>Not approved</span>;
  }
  if (!event.published) {
    return <span className={`${PILL} border-line text-mute`}>Draft</span>;
  }
  if (hasEnded(event)) {
    return <span className={`${PILL} border-line text-mute`}>Ended</span>;
  }
  return <span className={`${PILL} border-pine/60 bg-pine/10 text-pine`}>Live</span>;
}

/** Publish or unpublish an event, for hosts. Shows nothing while an event is in review or rejected. */
export function EventPublishButton({
  event,
  hostApproved,
}: {
  event: EventState;
  hostApproved: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  if (event.reviewStatus !== 'approved') return null;
  if (!hostApproved) {
    return <span className="text-[11px] text-mute">You can publish once you&apos;re approved</span>;
  }

  function setPublished(published: boolean) {
    if (
      !published &&
      !window.confirm(`Unpublish "${event.title}"? People won't be able to find or book it.`)
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await clientApi(`/organizer/events/${event.id}/publish`, {
          method: 'PATCH',
          body: { published },
        });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {event.published ? (
        <button type="button" className="btn-ghost" disabled={busy} onClick={() => setPublished(false)}>
          {busy ? 'Saving…' : 'Unpublish'}
        </button>
      ) : (
        <button type="button" className="btn-primary" disabled={busy} onClick={() => setPublished(true)}>
          {busy ? 'Publishing…' : 'Publish'}
        </button>
      )}
      {error && (
        <p role="alert" className="max-w-xs text-right text-xs text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
