"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/client-api';
import { ImageUpload } from '@/components/ImageUpload';
import { FieldLabel } from '@/components/FieldLabel';

export type PromoSlide = {
  id: string;
  image: string;
  title: string;
  subtitle: string | null;
  eventId: string | null;
  eventTitle: string | null;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

export type EventOption = { id: string; title: string };

type Draft = {
  id?: string;
  image: string;
  title: string;
  subtitle: string;
  eventId: string;
  startsAt: string;
  endsAt: string;
};

const EMPTY: Draft = { image: '', title: '', subtitle: '', eventId: '', startsAt: '', endsAt: '' };

/** ISO time to the local format a datetime-local input expects. */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

/** Fixed to India time, so the server and browser always show the same text. */
function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function scheduleText(p: PromoSlide): string | null {
  if (p.startsAt && p.endsAt) return `Shows ${formatWhen(p.startsAt)} to ${formatWhen(p.endsAt)}`;
  if (p.startsAt) return `Shows from ${formatWhen(p.startsAt)}`;
  if (p.endsAt) return `Shows until ${formatWhen(p.endsAt)}`;
  return null;
}

function statusOf(p: PromoSlide): { label: string; cls: string } {
  const now = Date.now();
  if (!p.active) return { label: 'Hidden', cls: 'border-line text-mute' };
  if (p.endsAt && new Date(p.endsAt).getTime() <= now) return { label: 'Ended', cls: 'border-line text-mute' };
  if (p.startsAt && new Date(p.startsAt).getTime() > now) {
    return { label: 'Scheduled', cls: 'border-gold/60 bg-gold/10 text-gold' };
  }
  return { label: 'Live', cls: 'border-pine/60 bg-pine/10 text-ink' };
}

export function PromotionsClient({ promos, events }: { promos: PromoSlide[]; events: EventOption[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.image) {
      setError('Please upload an image');
      return;
    }
    const body = {
      image: draft.image,
      title: draft.title,
      subtitle: draft.subtitle.trim() || null,
      eventId: draft.eventId || null,
      startsAt: draft.startsAt ? new Date(draft.startsAt).toISOString() : null,
      endsAt: draft.endsAt ? new Date(draft.endsAt).toISOString() : null,
    };
    await run(async () => {
      await clientApi(draft.id ? `/admin/promos/${draft.id}` : '/admin/promos', {
        method: draft.id ? 'PUT' : 'POST',
        body,
      });
      setDraft(null);
    });
  }

  function move(index: number, by: number) {
    const ids = promos.map((p) => p.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + by, 0, moved);
    run(() => clientApi('/admin/promos/order', { method: 'PUT', body: { ids } }));
  }

  // An event that has since passed still needs to show in the list when editing.
  const eventOptions =
    draft?.id && draft.eventId && !events.some((e) => e.id === draft.eventId)
      ? [...events, { id: draft.eventId, title: promos.find((p) => p.id === draft.id)?.eventTitle ?? 'Linked event' }]
      : events;

  return (
    <div className="mt-8 space-y-8">
      {error && (
        <div role="alert" className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      {draft ? (
        <form onSubmit={save} className="card grid gap-8 p-6 lg:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <h2 className="font-display text-xl text-ink">{draft.id ? 'Edit slide' : 'New slide'}</h2>
            <div>
              <FieldLabel
                label="Image"
                info="JPG, PNG or an animated GIF. Use a tall image, ideally 1127 × 1400 pixels, and keep the main subject in the middle, because the top holds the weather and profile icons, and the bottom holds your text. Keep GIFs under 3 MB so they load quickly on mobile data."
              />
              <ImageUpload value={draft.image} onChange={(image) => setDraft({ ...draft, image })} mode="admin" />
            </div>
            <div>
              <label className="label mb-1 block">Headline</label>
              <input
                className="input"
                value={draft.title}
                maxLength={60}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Maghe Sankranti Mela this weekend"
                required
              />
            </div>
            <div>
              <label className="label mb-1 block">Subtext (optional)</label>
              <input
                className="input"
                value={draft.subtitle}
                maxLength={120}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel label="Opens event (optional)" info="Tapping the slide opens this event. Only live, upcoming events are listed." />
              <select
                className="input"
                value={draft.eventId}
                onChange={(e) => setDraft({ ...draft, eventId: e.target.value })}
              >
                <option value="">No link</option>
                {eventOptions.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label mb-1 block">Start showing (optional)</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={draft.startsAt}
                  onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
                />
              </div>
              <div>
                <label className="label mb-1 block">Stop showing (optional)</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={draft.endsAt}
                  onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save slide'}
              </button>
              <button type="button" className="btn-ghost" disabled={busy} onClick={() => setDraft(null)}>
                Cancel
              </button>
            </div>
          </div>

          <div>
            <div className="label mb-2">Preview</div>
            <div className="relative aspect-[1127/1093] overflow-hidden rounded-b-3xl bg-panel">
              {draft.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/95" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <div className="font-display text-lg leading-tight">{draft.title || 'Your headline'}</div>
                {draft.subtitle && <div className="mt-1 text-xs text-white/80">{draft.subtitle}</div>}
              </div>
            </div>
          </div>
        </form>
      ) : (
        <button type="button" className="btn-primary" onClick={() => setDraft(EMPTY)}>
          + New slide
        </button>
      )}

      <div className="card divide-y divide-line">
        {promos.length === 0 && (
          <div className="p-6 text-sm text-mute">No slides yet. The app is showing its standard artwork.</div>
        )}
        {promos.map((p, i) => {
          const status = statusOf(p);
          return (
            <div key={p.id} className="flex flex-wrap items-center gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="h-20 w-16 shrink-0 rounded-lg border border-line object-cover" />
              <div className="min-w-0 flex-1 basis-48">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-sm text-ink">{p.title}</div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${status.cls}`}>
                    {status.label}
                  </span>
                </div>
                {p.subtitle && <div className="mt-0.5 truncate text-xs text-mute">{p.subtitle}</div>}
                <div className="mt-0.5 truncate text-xs text-mute">
                  {p.eventTitle ? `Opens ${p.eventTitle}` : 'No link'}
                </div>
                {scheduleText(p) && <div className="mt-0.5 truncate text-xs text-mute">{scheduleText(p)}</div>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" aria-label={`Move ${p.title} up`} className="btn-ghost" disabled={busy || i === 0} onClick={() => move(i, -1)}>↑</button>
                <button type="button" aria-label={`Move ${p.title} down`} className="btn-ghost" disabled={busy || i === promos.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={busy}
                  onClick={() =>
                    setDraft({
                      id: p.id,
                      image: p.image,
                      title: p.title,
                      subtitle: p.subtitle ?? '',
                      eventId: p.eventId ?? '',
                      startsAt: toLocalInput(p.startsAt),
                      endsAt: toLocalInput(p.endsAt),
                    })
                  }
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={busy}
                  onClick={() => run(() => clientApi(`/admin/promos/${p.id}`, { method: 'PUT', body: { active: !p.active } }))}
                >
                  {p.active ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Delete "${p.title}"?`)) {
                      run(() => clientApi(`/admin/promos/${p.id}`, { method: 'DELETE' }));
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
