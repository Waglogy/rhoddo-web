'use client';

import { useRef, useState } from 'react';
import { eventLink } from '@/lib/eventLink';
import { EventLinkQr } from './EventLinkQr';

/** Copy and WhatsApp buttons for a published event's link. */
export function ShareEventLink({
  eventId,
  slug,
  title,
  compact = false,
}: {
  eventId: string;
  slug?: string | null;
  title: string;
  compact?: boolean;
}) {
  const url = eventLink({ id: eventId, slug });
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
    <div className="card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-display text-lg text-ink">Registration link</div>
          <p className="mt-0.5 break-all text-sm text-mute">{url}</p>
          <p className="mt-1 text-xs text-mute">
            Anyone can register and pay on this page. Android users with the Rhoddo app can open it there.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          {copyButton}
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary whitespace-nowrap">
            Share on WhatsApp
          </a>
        </div>
      </div>
      <div className="mt-5 border-t border-line pt-5">
        <EventLinkQr url={url} fileName={slug || 'rhoddo-event'} />
      </div>
    </div>
  );
}
