'use client';

import { useState } from 'react';
import { clientApi } from '@/lib/client-api';

/** Most extra photos an event can have, besides its cover. Same limit as the API. */
export const MAX_GALLERY = 4;

/** Up to four extra event photos, shown on the event page and in the app. */
export function GalleryUpload({
  value,
  onChange,
  mode = 'admin',
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  mode?: 'admin' | 'host';
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const room = MAX_GALLERY - value.length;
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) setError(`Only ${MAX_GALLERY} extra photos fit, so the rest were left out.`);
    setUploading(true);
    const added: string[] = [];
    try {
      for (const file of picked) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await clientApi<{ url: string }>(mode === 'host' ? '/organizer/upload' : '/admin/upload', {
          method: 'POST',
          body: fd,
          isFormData: true,
        });
        added.push(res.url);
      }
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      if (added.length) onChange([...value, ...added]);
      setUploading(false);
    }
  }

  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((url, i) => (
          <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Event photo ${i + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2">
              <div className="flex gap-1">
                <button type="button" className="rounded-md bg-black/50 px-2 py-0.5 text-xs text-white disabled:opacity-30" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move left">←</button>
                <button type="button" className="rounded-md bg-black/50 px-2 py-0.5 text-xs text-white disabled:opacity-30" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move right">→</button>
              </div>
              <button
                type="button"
                className="rounded-md bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-primary"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label={`Remove photo ${i + 1}`}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {value.length < MAX_GALLERY && (
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line text-sm text-mute transition hover:border-primary hover:text-ink">
            <span className="text-2xl leading-none">{uploading ? '…' : '+'}</span>
            <span>{uploading ? 'Uploading…' : 'Add photos'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                void add(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>
      <p className="mt-2 text-xs text-mute">
        {value.length} of {MAX_GALLERY} added. Route maps, venue, last year&apos;s race: anything that helps people decide. Up to 8 MB each.
      </p>
      {error && <p className="mt-1 text-xs text-primary">{error}</p>}
    </div>
  );
}
