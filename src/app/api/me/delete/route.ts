import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

/**
 * Account deletion from rhoddo.com/me, in two steps: "request" emails a 6-digit code to the
 * address, "confirm" checks the code and deletes the account. Only the email's owner can do it.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const confirm = body?.step === 'confirm';
  const upstream = await fetch(`${API_URL}/me/${confirm ? 'confirm-deletion' : 'request-deletion'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(confirm ? { email: body.email, code: body.code } : { email: body.email }),
  });
  const data = await upstream.json().catch(() => ({ error: 'Something went wrong. Please try again.' }));
  return NextResponse.json(data, { status: upstream.status });
}
