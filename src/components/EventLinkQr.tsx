'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/**
 * A QR code for an event's registration link, for posters, banners and flyers.
 * Always black on white with a quiet border, so phones can scan it from print.
 */
export function EventLinkQr({ url, fileName }: { url: string; fileName: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 320, margin: 2, errorCorrectionLevel: 'M' })
      .then(setPreview)
      .catch(() => setFailed(true));
  }, [url]);

  async function download(kind: 'png' | 'svg') {
    try {
      const href =
        kind === 'png'
          ? await QRCode.toDataURL(url, { width: 2048, margin: 4, errorCorrectionLevel: 'M' })
          : URL.createObjectURL(
              new Blob([await QRCode.toString(url, { type: 'svg', margin: 4, errorCorrectionLevel: 'M' })], {
                type: 'image/svg+xml',
              }),
            );
      const a = document.createElement('a');
      a.href = href;
      a.download = `${fileName}-qr.${kind}`;
      a.click();
      if (kind === 'svg') setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch {
      setFailed(true);
    }
  }

  if (failed) return <p className="text-xs text-mute">Couldn&apos;t make the QR code. Refresh the page to try again.</p>;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="shrink-0 rounded-xl border border-line bg-white p-2">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`QR code for ${url}`} width={128} height={128} className="h-32 w-32" />
        ) : (
          <div className="h-32 w-32" />
        )}
      </div>
      <div className="text-center sm:text-left">
        <div className="text-sm font-medium text-ink">QR code</div>
        <p className="mt-0.5 max-w-xs text-xs text-mute">
          Put it on posters, banners and flyers. Scanning it opens the registration page.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <button type="button" className="btn-ghost" onClick={() => download('png')}>
            Download PNG
          </button>
          <button type="button" className="btn-ghost" onClick={() => download('svg')}>
            Download SVG (print)
          </button>
        </div>
      </div>
    </div>
  );
}
