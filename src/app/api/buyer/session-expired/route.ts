import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { USER_COOKIE } from '@/lib/auth';
import { safeNext } from '@/lib/safeNext';

// A buyer's sign-in ran out (or the account was deleted): forget it and sign in again.
export async function GET(req: Request) {
  (await cookies()).delete(USER_COOKIE);
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get('next'));
  return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(next)}`, url));
}
