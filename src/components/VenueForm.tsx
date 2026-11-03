"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/client-api';
import { ImageUpload } from './ImageUpload';

type VenueInitial = {
  id: string;
  name: string;
  kind: string;
  district: string;
  address: string;
  image: string;
  cover: string;
  rating: number;
  blurb: string;
};

const KINDS = ['restaurant', 'resort', 'hall', 'monastery', 'outdoor'];
const DISTRICTS = ['Gangtok', 'Pelling', 'Lachung', 'Yuksom', 'Namchi', 'Ravangla'];

export function VenueForm({
  initial,
  mode = 'admin',
  draftOnly = false,
}: {
  initial?: VenueInitial;
  mode?: 'admin' | 'host';
  /** The host isn't approved yet, so what they save stays private. */
  draftOnly?: boolean;
}) {
  const router = useRouter();
  const isEdit = !!initial;
  const apiBase = mode === 'host' ? '/organizer/venues' : '/admin/venues';
  const listPath = mode === 'host' ? '/host/venues' : '/manage-rhoddo/venues';

  const [name, setName] = useState(initial?.name || '');
  const [kind, setKind] = useState(initial?.kind || 'resort');
  const [district, setDistrict] = useState(initial?.district || 'Gangtok');
  const [address, setAddress] = useState(initial?.address || '');
  const [image, setImage] = useState(initial?.image || '');
  const [cover, setCover] = useState(initial?.cover || '');
  const [rating, setRating] = useState(initial?.rating ?? 4.5);
  const [blurb, setBlurb] = useState(initial?.blurb || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!image || !cover) {
      setError('Please upload both a square image and a cover image');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { name, kind, district, address, image, cover, rating: Number(rating), blurb };
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
    if (!confirm('Delete this venue?')) return;
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
            <label className="label mb-1 block">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label mb-1 block">Kind</label>
            <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
              {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-1 block">District</label>
            <select className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label mb-1 block">Address</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div>
            <label className="label mb-1 block">Rating</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={5}
              className="input"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label mb-1 block">Blurb</label>
            <textarea
              className="input min-h-[100px]"
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-xl text-ink">Square image</h2>
        <div className="mt-6"><ImageUpload value={image} onChange={setImage} mode={mode} /></div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-xl text-ink">Cover image</h2>
        <div className="mt-6"><ImageUpload value={cover} onChange={setCover} mode={mode} /></div>
      </section>

      {error && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          {isEdit && (
            <button type="button" onClick={onDelete} className="btn-danger">
              Delete venue
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : draftOnly ? 'Save draft' : isEdit ? 'Save changes' : 'Create venue'}
          </button>
        </div>
      </div>
    </form>
  );
}
