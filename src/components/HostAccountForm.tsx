'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateHostProfile } from '@/actions/hostAccount';

export type OrganizerProfile = {
  id: string;
  email: string;
  name: string;
  businessName: string;
  phone: string | null;
  status: 'pending' | 'approved' | 'suspended';
  freeTicketsRemaining: number;
  payoutAccountName: string | null;
  payoutAccountNo: string | null;
  payoutIfsc: string | null;
  createdAt: string;
  approvedAt: string | null;
};

export function HostAccountForm({ organizer }: { organizer: OrganizerProfile }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(organizer.name);
  const [businessName, setBusinessName] = useState(organizer.businessName);
  const [phone, setPhone] = useState(organizer.phone ?? '');
  const [payoutAccountName, setPayoutAccountName] = useState(organizer.payoutAccountName ?? '');
  const [payoutAccountNo, setPayoutAccountNo] = useState('');
  const [payoutIfsc, setPayoutIfsc] = useState(organizer.payoutIfsc ?? '');

  const maskedHint =
    organizer.payoutAccountNo && organizer.payoutAccountNo.startsWith('****')
      ? `${organizer.payoutAccountNo} on file — enter a new number only if you want to replace it`
      : undefined;

  useEffect(() => {
    setName(organizer.name);
    setBusinessName(organizer.businessName);
    setPhone(organizer.phone ?? '');
    setPayoutAccountName(organizer.payoutAccountName ?? '');
    setPayoutIfsc(organizer.payoutIfsc ?? '');
    setPayoutAccountNo('');
  }, [
    organizer.id,
    organizer.name,
    organizer.businessName,
    organizer.phone,
    organizer.payoutAccountName,
    organizer.payoutIfsc,
    organizer.payoutAccountNo,
  ]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(() => {
      updateHostProfile({
        name,
        businessName,
        phone,
        payoutAccountName,
        payoutAccountNo,
        payoutIfsc,
      })
        .then(() => {
          setPayoutAccountNo('');
          router.refresh();
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Save failed'));
    });
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-6">
      <h2 className="font-display text-xl text-ink">Profile &amp; payout</h2>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label mb-1 block">Email</label>
          <input className="input opacity-70" value={organizer.email} readOnly disabled />
          <p className="mt-1 text-[11px] text-mute">Contact support to change your login email.</p>
        </div>
        <div>
          <label className="label mb-1 block">Your name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label mb-1 block">Business name</label>
          <input
            className="input"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="label mb-1 block">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="text-sm font-medium text-ink">Payout (INR)</h3>
        <p className="mt-1 text-xs text-mute">Bank details for settlements. Keep these accurate.</p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label mb-1 block">Account holder name</label>
            <input
              className="input"
              value={payoutAccountName}
              onChange={(e) => setPayoutAccountName(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label mb-1 block">Account number</label>
            <input
              className="input"
              value={payoutAccountNo}
              onChange={(e) => setPayoutAccountNo(e.target.value)}
              placeholder="Leave blank to keep current account on file"
              autoComplete="off"
            />
            {maskedHint && <p className="mt-1 text-[11px] text-mute">{maskedHint}</p>}
          </div>
          <div>
            <label className="label mb-1 block">IFSC</label>
            <input
              className="input uppercase"
              value={payoutIfsc}
              onChange={(e) => setPayoutIfsc(e.target.value)}
              placeholder="e.g. SBIN0001234"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
