'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateHostProfile } from '@/actions/hostAccount';
import type { HostPayments } from './HostPaymentsCard';

export type OrganizerProfile = {
  id: string;
  email: string;
  name: string;
  businessName: string;
  phone: string | null;
  phoneVerified: boolean;
  status: 'pending' | 'approved' | 'suspended';
  commissionPercent: number | null;
  payments: HostPayments;
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

  useEffect(() => {
    setName(organizer.name);
    setBusinessName(organizer.businessName);
    setPhone(organizer.phone ?? '');
  }, [
    organizer.id,
    organizer.name,
    organizer.businessName,
    organizer.phone,
  ]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(() => {
      updateHostProfile({
        name,
        businessName,
        phone,
      })
        .then((result) => {
          if (result.ok) router.refresh();
          else setError(result.error);
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Save failed'));
    });
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-6">
      <h2 className="font-display text-xl text-ink">Profile</h2>

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
          <p className="mt-1 text-[11px] text-mute">If you change your number, you&apos;ll need to verify it again.</p>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="text-sm font-medium text-ink">Receiving payments</h3>
        <p className="mt-1 text-xs text-mute">
          You&apos;ll receive payments through your own Razorpay account, so Rhoddo never holds
          your money. Setup is coming soon.
        </p>
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
