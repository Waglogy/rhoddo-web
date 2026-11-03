"use client";

import { useState } from 'react';
import { clientApi } from '@/lib/client-api';

export function ImageUpload({
  value,
  onChange,
  mode = 'admin',
}: {
  value: string;
  onChange: (url: string) => void;
  mode?: 'admin' | 'host';
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadPath = mode === 'host' ? '/organizer/upload' : '/admin/upload';
      const res = await clientApi<{ url: string }>(uploadPath, {
        method: 'POST',
        body: fd,
        isFormData: true,
      });
      onChange(res.url);
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="cover"
            className="h-28 w-44 rounded-xl border border-line object-cover"
          />
        ) : (
          <div className="flex h-28 w-44 items-center justify-center rounded-xl border border-dashed border-line text-xs text-mute">
            No image
          </div>
        )}
        <div className="flex-1">
          <label className="btn-ghost inline-flex cursor-pointer">
            {uploading ? 'Uploading…' : 'Choose image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
          <p className="mt-2 text-xs text-mute">Upload an image, up to 8 MB.</p>
          {error && <p className="mt-2 text-xs text-primary">{error}</p>}
        </div>
      </div>
    </div>
  );
}
