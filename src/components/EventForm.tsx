"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/client-api';
import { FieldLabel } from './FieldLabel';
import { ImageUpload } from './ImageUpload';
import { GalleryUpload } from './GalleryUpload';
import { PdfUpload } from './PdfUpload';
import { toDateInput } from '@/lib/format';
import { slugify, registrationUrl } from '@/lib/eventLink';
import { districtOptions } from '@/lib/districts';
import { eventWords, isRegistrationEvent } from '@/lib/eventWords';

type Tier = {
  id?: string;
  name: string;
  priceINR: number;
  perks: string[];
  capacity: number;
  /** Youngest age allowed on the event day; null = any age. */
  minAge?: number | null;
};

type EventInitial = {
  id: string;
  title: string;
  slug?: string | null;
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
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  categoryLocked?: boolean;
  tiers: Tier[];
  termsText?: string;
  termsPdfUrl?: string | null;
  consentFormUrl?: string | null;
  registrationClosesAt?: string | null;
};


export function EventForm({
  venues,
  categories,
  initial,
  mode = 'admin',
  draftOnly = false,
}: {
  venues: Array<{ id: string; name: string }>;
  categories: Array<{ key: string; label: string }>;
  initial?: EventInitial;
  mode?: 'admin' | 'host';
  /** The host isn't approved yet, so this can only be saved as a draft. */
  draftOnly?: boolean;
}) {
  const router = useRouter();
  const isEdit = !!initial;
  const apiBase = mode === 'host' ? '/organizer/events' : '/admin/events';
  const listPath = mode === 'host' ? '/host/events' : '/manage-rhoddo/events';

  const [title, setTitle] = useState(initial?.title || '');
  const [tagline, setTagline] = useState(initial?.tagline || '');
  // Empty means "make one from the title" (new events, and older events without one).
  const [slug, setSlug] = useState(initial?.slug || '');
  const [category, setCategory] = useState(initial?.category || categories[0]?.key || '');
  const [district, setDistrict] = useState(initial?.district || 'Gangtok');
  const [date, setDate] = useState(toDateInput(initial?.date) || '');
  const [venueId, setVenueId] = useState(initial?.venueId || venues[0]?.id || '');
  const [hostName, setHostName] = useState(initial?.hostName || '');
  const [image, setImage] = useState(initial?.image || '');
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [colorHint, setColorHint] = useState(initial?.colorHint || '#C8402B');
  const [priceFromINR, setPriceFromINR] = useState(initial?.priceFromINR ?? 0);
  const [about, setAbout] = useState(initial?.about || '');
  const [tags, setTags] = useState((initial?.tags || []).join(', '));
  const [published, setPublished] = useState(initial?.published ?? true);
  const [tiers, setTiers] = useState<Tier[]>(
    initial?.tiers.length
      ? initial.tiers.map((t) => ({
          id: t.id,
          name: t.name,
          priceINR: t.priceINR,
          perks: t.perks,
          capacity: t.capacity,
          minAge: t.minAge ?? null,
        }))
      : [{ name: 'General', priceINR: 0, perks: [], capacity: 100 }]
  );

  const [termsText, setTermsText] = useState(initial?.termsText || '');
  const [termsPdfUrl, setTermsPdfUrl] = useState<string | null>(initial?.termsPdfUrl ?? null);
  const [consentFormUrl, setConsentFormUrl] = useState<string | null>(initial?.consentFormUrl ?? null);
  const [closesAt, setClosesAt] = useState(toDateInput(initial?.registrationClosesAt) || '');

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
    if (!image) {
      setError('Please upload a cover image');
      return;
    }
    if (closesAt && date && new Date(closesAt) > new Date(date)) {
      setError(`${isRegistrationEvent(category) ? 'Registration' : 'Booking'} must close before the event starts`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title,
        tagline,
        // Only sent when set or changed, so saving never renames a link people already have.
        slug: slug.trim() && slug.trim() !== initial?.slug ? slug.trim() : undefined,
        category,
        district,
        date: new Date(date).toISOString(),
        venueId,
        hostName,
        image,
        gallery,
        colorHint,
        priceFromINR: Number(priceFromINR),
        about,
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
        termsText,
        termsPdfUrl,
        consentFormUrl,
        registrationClosesAt: closesAt ? new Date(closesAt).toISOString() : null,
        // Host events go live after Rhoddo's review, then with the Publish button, so
        // the form never changes whether a host's event is live.
        published: mode === 'host' ? (isEdit ? undefined : false) : published,
        tiers: tiers.map((t) => ({
          id: t.id,
          name: t.name,
          priceINR: Number(t.priceINR),
          perks: t.perks,
          capacity: Number(t.capacity),
          minAge: t.minAge ? Number(t.minAge) : null,
        })),
      };
      if (isEdit) {
        await clientApi(`${apiBase}/${initial!.id}`, { method: 'PUT', body: payload });
      } else {
        const created = await clientApi<{ event: { id: string } }>(apiBase, { method: 'POST', body: payload });
        // Hosts land on the new event, where they can add a registration form.
        if (mode === 'host') {
          router.push(`/host/events/${created.event.id}?created=1`);
          router.refresh();
          return;
        }
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
      {mode === 'host' && initial?.reviewStatus === 'pending' && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
          Rhoddo is reviewing this event and will set its commission. It goes live once approved.
        </div>
      )}
      {mode === 'host' && initial?.reviewStatus === 'rejected' && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-ink">
          Rhoddo didn&apos;t approve this event. Edit it and save to send it for review again.
        </div>
      )}
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
          <div className="md:col-span-2">
            <label className="label mb-1 block">Registration link</label>
            <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-bg focus-within:border-gold">
              <span className="flex items-center whitespace-nowrap border-r border-line bg-panel px-3 text-sm text-mute">
                rhoddo.com/r/
              </span>
              <input
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-ink outline-none"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                onBlur={() => setSlug((s) => slugify(s))}
                placeholder={slugify(title) || 'gangtok-half-marathon'}
                maxLength={60}
              />
            </div>
            <p className="mt-1 text-xs text-mute">
              {initial?.slug && slug !== initial.slug
                ? `Links already shared as ${registrationUrl(initial.slug)} will stop working.`
                : 'Letters, numbers and dashes. Leave it empty to use the title.'}
            </p>
          </div>
          <div>
            <label className="label mb-1 block">Category</label>
            <select
              className="input disabled:opacity-60"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={mode === 'host' && initial?.categoryLocked}
            >
              {/* A hidden category stays selectable on events that already use it. */}
              {initial?.category && !categories.some((c) => c.key === initial.category) && (
                <option value={initial.category}>{initial.category}</option>
              )}
              {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            {mode === 'host' && <CategoryNote locked={!!initial?.categoryLocked} category={category} />}
          </div>
          <div>
            <label className="label mb-1 block">District</label>
            <select className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
              {districtOptions(initial?.district).map((d) => <option key={d} value={d}>{d}</option>)}
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
            <FieldLabel
              label="Host name"
              info="The person, group or company running this event. Buyers see this on the event page, so it can be different from the venue."
            />
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
            <FieldLabel
              label="Color hint"
              info="An accent colour saved with this event, as a hex code like #C8402B. It isn't shown on the app or website yet, so you can leave it as it is."
            />
            <input className="input" value={colorHint} onChange={(e) => setColorHint(e.target.value)} />
          </div>
          <div>
            <FieldLabel
              label="Tags (comma-separated)"
              info="Short words that describe your event, separated by commas, like Outdoor, Family, 18+. The first two appear on the event page in the app."
            />
            <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <FieldLabel
              label="About"
              info="The full description on your event page. Say what will happen, who it's for, and anything people should know before they come."
            />
            <textarea
              className="input min-h-[140px]"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              required
            />
          </div>
          {draftOnly && (
            <p className="md:col-span-2 text-sm text-mute">
              This will be saved and sent to Rhoddo for review. You can publish it once your
              account and the event are approved.
            </p>
          )}
          {mode === 'admin' && (
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
          )}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-xl text-ink">Cover image</h2>
        <div className="mt-6">
          <ImageUpload value={image} onChange={setImage} mode={mode} />
        </div>
        <h3 className="mt-8 font-display text-lg text-ink">More photos</h3>
        <div className="mt-3">
          <GalleryUpload value={gallery} onChange={setGallery} mode={mode} />
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">{isRegistrationEvent(category) ? 'Registration passes' : 'Ticket tiers'}</h2>
          <button type="button" onClick={addTier} className="btn-ghost">{isRegistrationEvent(category) ? '+ Add pass' : '+ Add tier'}</button>
        </div>
        <div className="mt-6 space-y-4">
          {tiers.map((t, i) => (
            <div key={i} className="rounded-xl border border-line bg-bg p-5">
              <div className="grid gap-4 md:grid-cols-5">
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
                <div>
                  <FieldLabel
                    label="Minimum age"
                    info="The youngest age allowed on the event day, e.g. 16 for a 10 km run. Leave empty for any age. It's checked against the Date of birth question in your registration form, so mark that question as the date of birth."
                  />
                  <input
                    type="number"
                    className="input"
                    value={t.minAge ?? ''}
                    placeholder="Any"
                    onChange={(e) => updateTier(i, { minAge: e.target.value ? Number(e.target.value) : null })}
                    min={1}
                    max={100}
                  />
                </div>
                <div className="md:col-span-5">
                  <FieldLabel
                    label="Perks (comma-separated)"
                    info={
                      isRegistrationEvent(category)
                        ? 'What this pass includes, separated by commas, like Timing chip, Finisher medal, T-shirt. People see these on the event page and when they register.'
                        : 'What this ticket includes, separated by commas, like Welcome drink, Reserved seat. Buyers see these on the event page and at checkout in the app.'
                    }
                  />
                  <input
                    className="input"
                    value={t.perks.join(', ')}
                    onChange={(e) =>
                      updateTier(i, {
                        perks: e.target.value
                          .split(/,(?!\s?\d{2,3}(?!\d))/)
                          .map((s) => s.trim().replace(/(\d),\s+(\d{2,3})(?!\d)/g, '$1,$2'))
                          .filter(Boolean),
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

      <section className="card p-6">
        <h2 className="font-display text-xl text-ink">Terms, consent & closing date</h2>
        <p className="mt-1 text-sm text-mute">
          If you add terms, people must read and accept them before they can {isRegistrationEvent(category) ? 'register' : 'book'}.
        </p>
        <div className="mt-6 grid gap-6">
          <div>
            <FieldLabel
              label="Terms and conditions"
              info="Shown in full before registration starts, in a box people scroll through and accept. Use a new line for each rule. Leave empty if your event has no terms of its own."
            />
            <textarea
              className="input min-h-[200px] font-[inherit]"
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              maxLength={30000}
              placeholder={'1. Registration fees are non-refundable and non-transferable.\n2. Participants must carry a valid age proof on race day.\n…'}
            />
            <p className="mt-1 text-xs text-mute">{termsText.length.toLocaleString('en-IN')} / 30,000 characters</p>
          </div>
          <div>
            <FieldLabel
              label="Terms as a PDF (optional)"
              info="Your full terms document, for people who want to download or print it. People can open it before accepting."
            />
            <PdfUpload value={termsPdfUrl} onChange={setTermsPdfUrl} mode={mode} />
          </div>
          <div>
            <FieldLabel
              label="Consent form to download (optional)"
              info="A form people download, sign and upload back, such as a parent or guardian's consent for runners under 18. Add a File question to your registration form, asked only to under-18s, so they can upload the signed copy."
            />
            <PdfUpload value={consentFormUrl} onChange={setConsentFormUrl} mode={mode} />
          </div>
          <div className="max-w-sm">
            <FieldLabel
              label={isRegistrationEvent(category) ? 'Registration closes' : 'Booking closes'}
              info="After this time nobody can sign up. Leave empty to stay open until the event starts."
            />
            <input type="datetime-local" className="input" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} />
            {closesAt && (
              <button type="button" className="mt-1 text-xs text-mute hover:text-primary" onClick={() => setClosesAt('')}>
                Clear
              </button>
            )}
          </div>
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
            {saving
              ? 'Saving…'
              : isEdit
                ? 'Save changes'
                : mode === 'host'
                  ? 'Submit for review'
                  : 'Create event'}
          </button>
        </div>
      </div>
    </form>
  );
}

function CategoryNote({ locked, category }: { locked: boolean; category: string }) {
  const w = eventWords(category);
  return (
    <p className="mt-1 text-[11px] text-mute">
      {locked && "The category can't change once people have signed up. "}
      Rhoddo reviews each new event once and sets its commission, a share of each {w.booking}.
      {w.registration && ' Sports and workshop events use registration wording: people register and get a pass.'}
    </p>
  );
}
