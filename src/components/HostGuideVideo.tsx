'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const VIDEO_SRC = '/videos/rhoddo-host-guide.mp4';
const POSTER_SRC = '/videos/rhoddo-host-guide.jpg';

/**
 * The host guide: a card on the dashboard that opens the video.
 * `openOnLoad` is set once, straight after signup, so a new host sees it first.
 */
export function HostGuideVideo({ openOnLoad = false }: { openOnLoad?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(openOnLoad);
  // Kept separately, because the prop turns false once the URL is cleaned up.
  const [isWelcome, setIsWelcome] = useState(openOnLoad);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Take the signup marker out of the URL, so a refresh doesn't reopen the video.
  useEffect(() => {
    if (openOnLoad) router.replace('/host', { scroll: false });
  }, [openOnLoad, router]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    // The voice is the point of this video, so it never starts muted. If the
    // browser blocks sound here, the host just presses play.
    videoRef.current?.play().catch(() => {});

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function close() {
    setOpen(false);
    setIsWelcome(false);
  }

  return (
    <>
      <div className="card mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-lg text-ink">New to hosting on Rhoddo?</div>
          <p className="mt-0.5 text-sm text-mute">
            See how to set up, sell tickets and scan guests at the gate.
          </p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="btn-ghost w-full shrink-0 sm:w-auto">
          Watch the guide · 2 min
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Rhoddo host guide"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={close}
        >
          <div className="card w-full max-w-5xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="font-display text-lg text-ink">
                  {isWelcome ? 'Welcome to Rhoddo' : 'Host guide'}
                </div>
                {isWelcome && (
                  <p className="text-sm text-mute">Here&apos;s how to get your first event live.</p>
                )}
              </div>
              <button ref={closeRef} type="button" onClick={close} className="btn-ghost shrink-0">
                Close
              </button>
            </div>
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              controls
              playsInline
              preload="metadata"
              className="block aspect-video max-h-[75vh] w-full bg-black"
            />
          </div>
        </div>
      )}
    </>
  );
}
