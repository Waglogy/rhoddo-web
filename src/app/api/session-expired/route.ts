import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, HOST_COOKIE } from '@/lib/auth';

// A saved login the API rejects (expired, or the signing secret changed). Clears
// it and sends the person to sign in again. The cookie has to be cleared here,
// because pages can't change cookies while they render.
export async function GET(req: Request) {
  const isHost = new URL(req.url).searchParams.get('as') === 'host';
  const res = NextResponse.redirect(new URL(isHost ? '/host/login' : '/login', req.url));
  res.cookies.delete(isHost ? HOST_COOKIE : ADMIN_COOKIE);
  return res;
}
