"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/client-api';
import { ImageUpload } from '@/components/ImageUpload';
import { FieldLabel } from '@/components/FieldLabel';

export type CategoryRow = {
  id: string;
  key: string;
  label: string;
  subtitle: string;
  image: string | null;
  icon: string;
  tint: string;
  active: boolean;
  eventCount: number;
  protected: boolean;
};

type Draft = {
  id?: string;
  key?: string;
  label: string;
  subtitle: string;
  image: string;
  icon: string;
  tint: string;
};

const EMPTY: Draft = { label: '', subtitle: '', image: '', icon: 'sparkles', tint: '#D1364B' };

const ICONS: Array<[string, string]> = [
  ['sparkles', 'Sparkles'],
  ['musical-notes', 'Music'],
  ['restaurant', 'Food'],
  ['color-palette', 'Art'],
  ['construct', 'Tools'],
  ['bicycle', 'Cycling'],
  ['trail-sign', 'Trail'],
  ['bed', 'Stay'],
  ['people', 'People'],
  ['heart', 'Heart'],
  ['book', 'Book'],
  ['camera', 'Camera'],
  ['leaf', 'Nature'],
  ['wine', 'Drinks'],
  ['football', 'Sports'],
  ['film', 'Film'],
];

/** The app's built-in artwork, shown here until an admin uploads a replacement. */
const BUILT_IN_IMAGES: Record<string, string> = {
  music: '/landing/mood-livemusic.jpg',
  food: '/landing/mood-foodanddining.jpg',
  cultural: '/landing/mood-cultural.jpg',
  workshop: '/landing/mood-workshops.jpg',
  festival: '/landing/mood-festivals.jpg',
  sports: '/landing/mood-sports.jpg',
  adventure: '/landing/mood-adventure.jpg',
  resort: '/landing/mood-stays.jpg',
};

const imageFor = (c: { key?: string; image?: string | null }) =>
  c.image || (c.key ? BUILT_IN_IMAGES[c.key] : undefined);

export function CategoriesClient({ categories }: { categories: CategoryRow[] }) {
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
    if (!imageFor(draft)) {
      setError('Please upload an image');
      return;
    }
    await run(async () => {
      await clientApi(draft.id ? `/admin/categories/${draft.id}` : '/admin/categories', {
        method: draft.id ? 'PUT' : 'POST',
        body: {
          label: draft.label,
          subtitle: draft.subtitle,
          icon: draft.icon,
          tint: draft.tint,
          ...(draft.image && { image: draft.image }),
        },
      });
      setDraft(null);
    });
  }

  function move(index: number, by: number) {
    const ids = categories.map((c) => c.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + by, 0, moved);
    run(() => clientApi('/admin/categories/order', { method: 'PUT', body: { ids } }));
  }

  const preview = draft && (draft.image || imageFor(draft));

  return (
    <div className="mt-8 space-y-8">
      {error && (
        <div role="alert" className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      {draft ? (
        <form onSubmit={save} className="card grid gap-8 p-6 lg:grid-cols-[1fr_180px]">
          <div className="space-y-5">
            <h2 className="font-display text-xl text-ink">{draft.id ? 'Edit category' : 'New category'}</h2>
            <div>
              <FieldLabel label="Image" info="A square-ish photo works best, because the app crops it to a tall card. Keep the subject near the top, since the name sits over the bottom." />
              <ImageUpload value={draft.image} onChange={(image) => setDraft({ ...draft, image })} mode="admin" />
              {draft.id && !draft.image && imageFor(draft) && (
                <p className="mt-2 text-xs text-mute">Using the built-in image. Upload one to replace it.</p>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label mb-1 block">Name</label>
                <input
                  className="input"
                  value={draft.label}
                  maxLength={30}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  placeholder="Night Markets"
                  required
                />
              </div>
              <div>
                <label className="label mb-1 block">Subtitle</label>
                <input
                  className="input"
                  value={draft.subtitle}
                  maxLength={30}
                  onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                  placeholder="after dark"
                  required
                />
              </div>
              <div>
                <label className="label mb-1 block">Icon</label>
                <select
                  className="input"
                  value={draft.icon}
                  onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                >
                  {ICONS.map(([value, name]) => (
                    <option key={value} value={value}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel label="Accent colour" info="The small coloured bar above the name on the card." />
                <input
                  type="color"
                  className="input h-[50px] cursor-pointer p-1"
                  value={draft.tint}
                  onChange={(e) => setDraft({ ...draft, tint: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save category'}
              </button>
              <button type="button" className="btn-ghost" disabled={busy} onClick={() => setDraft(null)}>
                Cancel
              </button>
            </div>
          </div>
          <div>
            <div className="label mb-2">Preview</div>
            <div className="relative h-[180px] w-[150px] overflow-hidden rounded-2xl bg-panel">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <div className="mb-1 h-[3px] w-6 rounded" style={{ backgroundColor: draft.tint }} />
                <div className="font-display text-sm leading-tight">{draft.label || 'Name'}</div>
                <div className="mt-0.5 text-[9px] uppercase tracking-wider text-white/70">
                  {draft.subtitle || 'subtitle'}
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <button type="button" className="btn-primary" onClick={() => setDraft(EMPTY)}>
          + New category
        </button>
      )}

      <div className="card divide-y divide-line">
        {categories.map((c, i) => {
          const image = imageFor(c);
          return (
            <div key={c.id} className="flex flex-wrap items-center gap-4 p-4">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-line object-cover" />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-lg border border-line" />
              )}
              <div className="min-w-0 flex-1 basis-48">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-sm text-ink">{c.label}</div>
                  {!c.active && (
                    <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-mute">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-xs text-mute">
                  {c.subtitle} · {c.eventCount} event{c.eventCount === 1 ? '' : 's'}
                  {c.protected && ' · Always free, needs review'}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" aria-label={`Move ${c.label} up`} className="btn-ghost" disabled={busy || i === 0} onClick={() => move(i, -1)}>↑</button>
                <button type="button" aria-label={`Move ${c.label} down`} className="btn-ghost" disabled={busy || i === categories.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={busy}
                  onClick={() =>
                    setDraft({
                      id: c.id,
                      key: c.key,
                      label: c.label,
                      subtitle: c.subtitle,
                      image: c.image ?? '',
                      icon: c.icon,
                      tint: c.tint,
                    })
                  }
                >
                  Edit
                </button>
                {!c.protected && (
                  <>
                    <button
                      type="button"
                      className="btn-ghost"
                      disabled={busy}
                      onClick={() =>
                        run(() => clientApi(`/admin/categories/${c.id}`, { method: 'PUT', body: { active: !c.active } }))
                      }
                    >
                      {c.active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm(`Delete "${c.label}"?`)) {
                          run(() => clientApi(`/admin/categories/${c.id}`, { method: 'DELETE' }));
                        }
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
