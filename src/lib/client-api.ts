"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function readClientToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  // Try host cookie first (host portal pages), fall back to admin cookie.
  const host = document.cookie.match(/(?:^|;\s*)rhoddo_host=([^;]+)/);
  if (host) return decodeURIComponent(host[1]);
  const admin = document.cookie.match(/(?:^|;\s*)rhoddo_admin=([^;]+)/);
  return admin ? decodeURIComponent(admin[1]) : undefined;
}

export async function clientApi<T = any>(
  path: string,
  init: { method?: string; body?: unknown; isFormData?: boolean } = {}
): Promise<T> {
  const token = readClientToken();
  const headers: Record<string, string> = {};
  if (!init.isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: init.method || 'GET',
    headers,
    body: init.isFormData
      ? (init.body as any)
      : init.body !== undefined
        ? JSON.stringify(init.body)
        : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export const API_BASE = API_URL;
