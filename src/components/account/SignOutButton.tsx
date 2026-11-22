'use client';

import { useState } from 'react';
import { buyerApi } from '@/lib/buyerApi';

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await buyerApi('/api/buyer/logout', { body: {} }).catch(() => {});
        window.location.assign('/');
      }}
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
