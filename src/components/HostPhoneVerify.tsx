'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { confirmHostPhoneCode, sendHostPhoneCode } from '@/actions/hostPhone';

export function HostPhoneVerify({ initialPhone }: { initialPhone: string | null }) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  function sendCode() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await sendHostPhoneCode(phone);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCode('');
      setCodeSent(true);
      setNotice('Code sent. It works for 5 minutes.');
    });
  }

  function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await confirmHostPhoneCode(phone, code);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mb-8 rounded-2xl border border-gold/40 bg-gold/5 p-5">
      <div className="text-sm font-medium text-ink">Verify your phone number</div>
      <p className="mt-1 text-xs text-mute">
        Verify your number to submit your application. We can only approve your account once it&apos;s verified.
      </p>

      <form onSubmit={confirmCode} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1 sm:max-w-xs">
          <label htmlFor="host-phone" className="label mb-1 block">Mobile number</label>
          <input
            id="host-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="input py-2 text-sm"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setCodeSent(false);
            }}
            placeholder="10-digit mobile number"
            disabled={busy}
          />
        </div>

        {codeSent && (
          <div className="w-36">
            <label htmlFor="host-phone-code" className="label mb-1 block">6-digit code</label>
            <input
              id="host-phone-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="input py-2 text-sm tracking-[0.2em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              disabled={busy}
            />
          </div>
        )}

        {codeSent && (
          <button type="submit" className="btn-primary" disabled={busy || code.length !== 6}>
            {busy ? 'Checking…' : 'Verify'}
          </button>
        )}
        <button
          type="button"
          className={codeSent ? 'btn-ghost' : 'btn-primary'}
          onClick={sendCode}
          disabled={busy || !phone.trim()}
        >
          {codeSent ? 'Resend code' : busy ? 'Sending…' : 'Send code'}
        </button>
      </form>

      <div aria-live="polite">
        {notice && <p className="mt-3 text-xs text-mute">{notice}</p>}
        {error && <p className="mt-3 text-xs text-ink">{error}</p>}
      </div>
    </div>
  );
}
