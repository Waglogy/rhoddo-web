'use client';

// The event's cover plus up to four more photos. Posters are often tall and full of text,
// so images are never cropped: they sit on a blurred copy of themselves instead.

import { useCallback, useEffect, useState } from 'react';

export function EventGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const count = images.length;
  const step = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);

  useEffect(() => {
    if (!viewer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewer(false);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [viewer, step]);

  if (!count) return null;
  const current = images[index];

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setViewer(true)}
        className="group relative flex w-full justify-center overflow-hidden rounded-3xl border border-line bg-panel"
        aria-label={`View ${count > 1 ? `photo ${index + 1} of ${count}` : 'photo'} full screen`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={index === 0 ? title : `${title}, photo ${index + 1}`}
          className="block max-h-[70vh] w-auto max-w-full object-contain"
        />
        {count > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-0.5 text-xs text-white">
            {index + 1} / {count}
          </span>
        )}
      </button>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Event photos">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-28 ${
                i === index ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {viewer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setViewer(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt="" className="max-h-[92dvh] max-w-[96vw] object-contain" onClick={(e) => e.stopPropagation()} />
          <button type="button" className="absolute right-4 top-4 rounded-full bg-white/15 px-4 py-2 text-sm text-white hover:bg-white/25" onClick={() => setViewer(false)}>
            Close
          </button>
          {count > 1 && (
            <>
              <button type="button" aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-4 py-3 text-xl text-white hover:bg-white/25" onClick={(e) => { e.stopPropagation(); step(-1); }}>‹</button>
              <button type="button" aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-4 py-3 text-xl text-white hover:bg-white/25" onClick={(e) => { e.stopPropagation(); step(1); }}>›</button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">{index + 1} / {count}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
