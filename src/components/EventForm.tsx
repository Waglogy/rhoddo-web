"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/client-api';
import { ImageUpload } from './ImageUpload';
import { toDateInput } from '@/lib/format';

type Tier = {
  id?: string;
  name: string;
  priceINR: number;
  perks: string[];
  capacity: number;
};

type EventInitial = {
  id: string;
  title: string;
  tagline: string;
  category: string;
  district: string;
  date: string;
  endDate?: string | null;
  venueId: string;
  hostName: string;
  image: string;
  gallery: string[];
  colorHint: string;
  priceFromINR: number;
  about: string;
  tags: string[];
  published: boolean;
  tiers: Tier[];
};

const CATEGORIES = ['music', 'food', 'cultural', 'resort', 'adventure', 'festival'];
const DISTRICTS = ['Gangtok', 'Pelling', 'Lachung', 'Yuksom', 'Namchi', 'Ravangla'];

export function EventForm({
  venues,
  initial,
  mode = 'admin',
}: {
  venues: Array<{ id: string; name: string }>;
  initial?: EventInitial;
  mode?: 'admin' | 'host';
}) {
  const router = useRouter();
  const isEdit = !!initial;
  const apiBase = mode === 'host' ? '/organizer/events' : '/admin/events';
  const listPath = mode === 'host' ? '/host/events' : '/admin/events';

  const [title, setTitle] = useState(initial?.title || '');
  const [tagline, setTagline] = useState(initial?.tagline || '');
  const [category, setCategory] = useState(initial?.category || 'music');
  const [district, setDistrict] = useState(initial?.district || 'Gangtok');
  const [date, setDate] = useState(toDateInput(initial?.date) || '');
  const [venueId, setVenueId] = useState(initial?.venueId || venues[0]?.id || '');
  const [hostName, setHostName] = useState(initial?.hostName || '');
  const [image, setImage] = useState(initial?.image || '');
  const [colorHint, setColorHint] = useState(initial?.colorHint || '#C8402B');
  const [priceFromINR, setPriceFromINR] = useState(initial?.priceFromINR ?? 0);
  const [about, setAbout] = useState(initial?.about || '');
  const [tags, setTags] = useState((initial?.tags || []).join(', '));
  const [published, setPublished] = useState(initial?.published ?? true);
  const [tiers, setTiers] = useState<Tier[]>(
    initial?.tiers.length
      ? initial.tiers.map((t) => ({
          name: t.name,
          priceINR: t.priceINR,
          perks: t.perks,
          capacity: t.capacity,
        }))
      : [{ name: 'General', priceINR: 0, perks: [], capacity: 100 }]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateTier(i: number, patch: Partial<Tier>) {
    setTiers((arr) => arr.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function addTier() {
    setTiers((arr) => [...arr, { name: '', priceINR: 0, perks: [], capacity: 50 }]);
  }
  function removeTier(i: number) {
    setTiers((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title,
        tagline,
        category,
        district,
        date: new Date(date).toISOString(),
        venueId,
        hostName,
        image,
        gallery: [],
        colorHint,
        priceFromINR: Number(priceFromINR),
        about,
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
        published,
        tiers: tiers.map((t) => ({
          name: t.name,
          priceINR: Number(t.priceINR),
          perks: t.perks,
          capacity: Number(t.capacity),
        })),
      };
      if (isEdit) {
        await clientApi(`${apiBase}/${initial!.id}`, { method: 'PUT', body: payload });
      } else {
        await clientApi(apiBase, { method: 'POST', body: payload });
      }
      router.push(listPath);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!isEdit) return;
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      await clientApi(`${apiBase}/${initial!.id}`, { method: 'DELETE' });
      router.push(listPath);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <section className="card p-6">
        <h2 className="font-display text-xl text-ink">Basics</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label mb-1 block">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="label mb-1 block">Tagline</label>
            <input className="input" value={tagline} onChange={(e) => setTagline(e.target.value)} required />
          </div>
          <div>
            <label className="label mb-1 block">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-1 block">District</label>
            <select className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-1 block">Date & time</label>
            <input
              type="datetime-local"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label mb-1 block">Venue</label>
            <select className="input" value={venueId} onChange={(e) => setVenueId(e.target.value)} required>
              {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-1 block">Host name</label>
            <input className="input" value={hostName} onChange={(e) => setHostName(e.target.value)} required />
          </div>
          <div>
            <label className="label mb-1 block">Starting price (INR)</label>
            <input
              type="number"
              className="input"
              value={priceFromINR}
              onChange={(e) => setPriceFromINR(Number(e.target.value))}
              min={0}
              required
            />
          </div>
          <div>
            <label className="label mb-1 block">Color hint</label>
            <input className="input" value={colorHint} onChange={(e) => setColorHint(e.target.value)} />
          </div>
          <div>
            <label className="label mb-1 block">Tags (comma-separated)</label>
            <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label mb-1 block">About</label>
            <textarea
              className="input min-h-[140px]"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <label htmlFor="published" className="text-sm text-ink">Published</label>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-xl text-ink">Cover image</h2>
        <div className="mt-6">
          <ImageUpload value={image} onChange={setImage} mode={mode} />
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Ticket tiers</h2>
          <button type="button" onClick={addTier} className="btn-ghost">+ Add tier</button>
        </div>
        <div className="mt-6 space-y-4">
          {tiers.map((t, i) => (
            <div key={i} className="rounded-xl border border-line bg-bg p-5">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <label className="label mb-1 block">Name</label>
                  <input
                    className="input"
                    value={t.name}
                    onChange={(e) => updateTier(i, { name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label mb-1 block">Price (INR)</label>
                  <input
                    type="number"
                    className="input"
                    value={t.priceINR}
                    onChange={(e) => updateTier(i, { priceINR: Number(e.target.value) })}
                    min={0}
                    required
                  />
                </div>
                <div>
                  <label className="label mb-1 block">Capacity</label>
                  <input
                    type="number"
                    className="input"
                    value={t.capacity}
                    onChange={(e) => updateTier(i, { capacity: Number(e.target.value) })}
                    min={1}
                    required
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="label mb-1 block">Perks (comma-separated)</label>
                  <input
                    className="input"
                    value={t.perks.join(', ')}
                    onChange={(e) =>
                      updateTier(i, {
                        perks: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>
              {tiers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTier(i)}
                  className="mt-3 text-xs text-mute hover:text-primary"
                >
                  Remove tier
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          {isEdit && (
            <button type="button" onClick={onDelete} className="btn-danger">
              Delete event
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
          </button>
        </div>
      </div>
    </form>
  );
}
