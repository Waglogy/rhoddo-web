'use client';

import { useRef, useState } from 'react';
import { eventShareUrl } from '@/lib/eventLink';

/** Copy and WhatsApp buttons for a published event's link. */
export function ShareEventLink({
  eventId,
  title,
  compact = false,
}: {
  eventId: string;
  title: string;
  compact?: boolean;
}) {
  const url = eventShareUrl(eventId);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setCopyFailed(false);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
  }

  const copyButton = (
    <button type="button" onClick={copy} className="btn-ghost whitespace-nowrap">
      {copied ? 'Copied' : 'Copy link'}
    </button>
  );

  if (compact) {
    return (
      <div>
        {copyButton}
        {copyFailed && <div className="mt-1 break-all text-[11px] text-mute">{url}</div>}
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} on Rhoddo: ${url}`)}`;

  return (
    <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-display text-lg text-ink">Share this event</div>
        <p className="mt-0.5 break-all text-sm text-mute">{url}</p>
        <p className="mt-1 text-xs text-mute">Opens in the Rhoddo app for anyone who has it.</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        {copyButton}
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary whitespace-nowrap">
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
