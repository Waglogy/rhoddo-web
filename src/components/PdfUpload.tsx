"use client";

import { useState } from 'react';
import { clientApi } from '@/lib/client-api';

/** Uploads a public PDF (event terms, a printable consent form) and keeps its link. */
export function PdfUpload({
  value,
  onChange,
  mode = 'admin',
  emptyText = 'No PDF added',
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  mode?: 'admin' | 'host';
  emptyText?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Choose a PDF file');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('The PDF must be under 8 MB');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await clientApi<{ url: string }>(mode === 'host' ? '/organizer/upload' : '/admin/upload', {
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
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink hover:border-gold">
            <span aria-hidden>📄</span> View PDF
          </a>
        ) : (
          <span className="text-sm text-mute">{emptyText}</span>
        )}
        <label className="btn-ghost inline-flex cursor-pointer">
          {uploading ? 'Uploading…' : value ? 'Replace PDF' : 'Upload PDF'}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) handleFile(f);
            }}
          />
        </label>
        {value && (
          <button type="button" className="text-xs text-mute hover:text-primary" onClick={() => onChange(null)}>
            Remove
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-primary">{error}</p>}
    </div>
  );
}
