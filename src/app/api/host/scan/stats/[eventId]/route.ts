import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { HOST_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

type Props = { params: Promise<{ eventId: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { eventId } = await params;
  const c = await cookies();
  const token = c.get(HOST_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const upstream = await fetch(`${API_URL}/tickets/event/${eventId}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const text = await upstream.text();
  const data = text ? JSON.parse(text) : null;
  return NextResponse.json(data, { status: upstream.status });
}
