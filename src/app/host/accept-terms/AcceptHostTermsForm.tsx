'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/client-api';

export function AcceptHostTermsForm() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      await clientApi('/organizer/accept-terms', { method: 'POST' });
      router.replace('/host');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <label className="flex items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#D1364B]"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span>
          I have read and accept the{' '}
          <Link href="/host-terms" target="_blank" className="text-gold underline-offset-2 hover:underline">
            Rhoddo Host Terms
          </Link>{' '}
          and the{' '}
          <Link href="/privacy" target="_blank" className="text-gold underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      {error && (
        <p role="alert" className="text-sm text-primary">
          {error}
        </p>
      )}
      <button type="button" className="btn-primary w-full" disabled={!checked || busy} onClick={accept}>
        {busy ? 'Saving…' : 'Accept and continue'}
      </button>
    </div>
  );
}
