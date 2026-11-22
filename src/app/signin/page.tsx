import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { loadSignedInBuyer } from '@/lib/publicEvent';
import { PLACEHOLDER_NAME } from '@/lib/buyerApi';
import { safeNext } from '@/lib/safeNext';
import { AccountShell } from '@/components/account/AccountShell';
import { SignInForm } from '@/components/account/SignInForm';

export const metadata: Metadata = { title: 'Sign in · Rhoddo', robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string }> };

// rhoddo.com/signin: sign in or create a Rhoddo account (the same account as the app),
// with a code sent by email or with Google. Registering for an event starts here.
export default async function SignInPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next);
  const user = await loadSignedInBuyer();
  // Already signed in with a finished profile: carry on.
  if (user && user.termsAccepted && user.name && user.name !== PLACEHOLDER_NAME) redirect(next);

  return (
    <AccountShell>
      <div className="mx-auto max-w-md">
        <SignInForm next={next} initialUser={user} googleClientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID} />
      </div>
    </AccountShell>
  );
}

/** Rhoddo's Google "web" client (public, not a secret). The API accepts tokens issued for it. */
const DEFAULT_GOOGLE_CLIENT_ID = '1014494730340-v3hjhhht736jui8dj11b195qabk6153m.apps.googleusercontent.com';
