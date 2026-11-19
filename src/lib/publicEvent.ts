// Loads an event for its public registration page, by short link name or id.

import { cache } from 'react';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/api';
import { USER_COOKIE } from '@/lib/auth';
import type { Buyer } from '@/lib/buyerApi';
import type { EventForm } from '@/components/register/RegistrationFields';

export type PublicEvent = {
  id: string;
  slug: string | null;
  title: string;
  category?: string;
  tagline: string;
  about: string;
  district: string;
  date: string;
  endDate: string | null;
  image: string;
  hostName: string;
  priceFromINR: number;
  venue?: { name: string; address?: string | null } | null;
  tiers: Array<{ id: string; name: string; priceINR: number; perks: string[]; capacity: number; left: number }>;
  form?: EventForm | null;
};

export type EventLookup = { event: PublicEvent } | { problem: 'missing' | 'unavailable' };

async function load(path: string): Promise<EventLookup> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
    if (res.status === 404) return { problem: 'missing' };
    if (!res.ok) return { problem: 'unavailable' };
    const data = (await res.json()) as { event: PublicEvent };
    return { event: data.event };
  } catch {
    return { problem: 'unavailable' };
  }
}

// Cached per request, so the page and its link preview make one request between them.
export const loadEventBySlug = cache((slug: string) => load(`/events/by-slug/${encodeURIComponent(slug)}`));
export const loadEventById = cache((id: string) => load(`/events/${encodeURIComponent(id)}`));

/** The buyer signed in on this browser, or null. Same account as the app. */
export async function loadSignedInBuyer(): Promise<Buyer | null> {
  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!res.ok) return null;
    const { user } = (await res.json()) as { user: Buyer };
    return user;
  } catch {
    return null;
  }
}

// Written out in Sikkim time, because the server may run in another time zone.
export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatPlace(event: Pick<PublicEvent, 'venue' | 'district'>): string {
  return [event.venue?.name, event.district].filter(Boolean).join(', ');
}

export function eventHasEnded(event: Pick<PublicEvent, 'date' | 'endDate'>): boolean {
  return new Date(event.endDate ?? event.date).getTime() < Date.now();
}
