import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE = 'rhoddo_admin';
export const HOST_COOKIE = 'rhoddo_host';
/** A buyer who signed in on a registration page (rhoddo.com/r/...). Same account as the app. */
export const USER_COOKIE = 'rhoddo_user';

export async function requireAdminToken(): Promise<string> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  if (!token) redirect('/login');
  return token;
}

export async function getAdminToken(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(ADMIN_COOKIE)?.value;
}

export async function requireHostToken(): Promise<string> {
  const c = await cookies();
  const token = c.get(HOST_COOKIE)?.value;
  if (!token) redirect('/host/login');
  return token;
}

export async function getHostToken(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(HOST_COOKIE)?.value;
}
