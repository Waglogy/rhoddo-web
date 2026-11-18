import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { USER_COOKIE } from '@/lib/auth';

export async function POST() {
  (await cookies()).delete(USER_COOKIE);
  return NextResponse.json({ ok: true });
}
