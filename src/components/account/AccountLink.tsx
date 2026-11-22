import Link from 'next/link';
import { loadSignedInBuyer } from '@/lib/publicEvent';
import { PLACEHOLDER_NAME } from '@/lib/buyerApi';

/** "Sign in" for visitors, or the runner's first name linking to their account. */
export async function AccountLink({ className = '' }: { className?: string }) {
  const user = await loadSignedInBuyer();
  const first = user?.name && user.name !== PLACEHOLDER_NAME ? user.name.trim().split(/\s+/)[0] : null;
  return (
    <Link
      href={user ? '/account' : '/signin'}
      className={`inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-ink transition hover:border-ink/30 ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="text-mute">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {user ? (
        first ? (
          <>
            {first.slice(0, 14)}
            <span className="hidden sm:inline"> · My account</span>
          </>
        ) : (
          'My account'
        )
      ) : (
        'Sign in'
      )}
    </Link>
  );
}
