"use client";

import { useRouter } from 'next/navigation';

export function HostLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/host/logout', { method: 'POST' });
    router.push('/host/login');
    router.refresh();
  }

  return (
    <button onClick={logout} className="btn-ghost w-full">
      Sign out
    </button>
  );
}
