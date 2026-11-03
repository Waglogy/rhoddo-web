"use client";

import { useEffect, useRef, useState } from 'react';

/** A form label with a small "i" button that shows what the field is for. */
export function FieldLabel({ label, info }: { label: string; info: string }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative mb-1 flex items-center gap-1">
      <label className="label">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`What is ${label}?`}
        aria-expanded={open}
        className="rounded-full p-1 text-mute transition hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </button>
      {open && (
        <div
          role="status"
          className="absolute left-0 top-full z-20 mt-1 w-72 max-w-full rounded-xl border border-line bg-bg p-3 text-xs leading-relaxed text-ink shadow-lg"
        >
          {info}
        </div>
      )}
    </div>
  );
}
