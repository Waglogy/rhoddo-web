'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/client-api';

export type FormFieldType =
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'date'
  | 'phone'
  | 'email'
  | 'select'
  | 'multi_select'
  | 'checkbox'
  | 'image';

export type FormField = {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  help?: string;
  options?: string[];
  /** Offer "Same as Person 1" for this question in group registrations. */
  copyable?: boolean;
};

export type EventFormDef = {
  name: string;
  description: string;
  perTicket: boolean;
  fields: FormField[];
};

const TYPE_LABELS: Record<FormFieldType, string> = {
  short_text: 'Short answer',
  long_text: 'Paragraph',
  number: 'Number',
  date: 'Date',
  phone: 'Phone number',
  email: 'Email',
  select: 'Choose one',
  multi_select: 'Choose several',
  checkbox: 'Tick box (yes / no)',
  image: 'Photo upload (ID, photo, certificate)',
};

const isChoice = (t: FormFieldType) => t === 'select' || t === 'multi_select';

function newId() {
  return `f_${Math.random().toString(36).slice(2, 10)}`;
}

const RUNNER_TEMPLATE: EventFormDef = {
  name: 'Runner details',
  description: 'Fill this in for every runner. We use it for bibs, T-shirts and safety on the day.',
  perTicket: true,
  fields: [
    { id: newId(), label: 'Full name', type: 'short_text', required: true },
    { id: newId(), label: 'Date of birth', type: 'date', required: true },
    { id: newId(), label: 'Gender', type: 'select', required: true, options: ['Female', 'Male', 'Other'] },
    { id: newId(), label: 'T-shirt size', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: newId(), label: 'Emergency contact name', type: 'short_text', required: true, copyable: true },
    { id: newId(), label: 'Emergency contact phone', type: 'phone', required: true, copyable: true },
    { id: newId(), label: 'Medical conditions we should know about', type: 'long_text', required: false },
    {
      id: newId(),
      label: 'I am fit to take part and accept the event rules',
      type: 'checkbox',
      required: true,
    },
  ],
};

const BLANK: EventFormDef = {
  name: 'Registration',
  description: '',
  perTicket: false,
  fields: [{ id: newId(), label: '', type: 'short_text', required: true }],
};

/**
 * Lets a host add a registration form to an event. Buyers fill it in at checkout,
 * in the app and on the website, before paying.
 */
export function RegistrationFormEditor({
  eventId,
  initial,
  hasSales,
}: {
  eventId: string;
  initial: EventFormDef | null;
  hasSales: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<EventFormDef | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, startTransition] = useTransition();
  // Questions buyers have already answered. With sales, these can't be removed or retyped.
  const lockedIds = new Set(hasSales ? (initial?.fields ?? []).map((f) => f.id) : []);

  function update(patch: Partial<EventFormDef>) {
    setForm((f) => (f ? { ...f, ...patch } : f));
    setSaved(false);
  }
  function updateField(i: number, patch: Partial<FormField>) {
    if (!form) return;
    update({ fields: form.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)) });
  }
  function moveField(i: number, by: -1 | 1) {
    if (!form) return;
    const fields = [...form.fields];
    const j = i + by;
    if (j < 0 || j >= fields.length) return;
    [fields[i], fields[j]] = [fields[j], fields[i]];
    update({ fields });
  }

  function save() {
    if (!form) return;
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          ...form,
          fields: form.fields.map((f) => ({
            ...f,
            help: f.help?.trim() || undefined,
            options: isChoice(f.type) ? (f.options ?? []).map((o) => o.trim()).filter(Boolean) : undefined,
            copyable: form.perTicket && f.type !== 'image' && f.copyable ? true : undefined,
          })),
        };
        const res = await clientApi<{ form: EventFormDef }>(`/organizer/events/${eventId}/form`, {
          method: 'PUT',
          body: payload,
        });
        setForm(res.form);
        setSaved(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save the form');
      }
    });
  }

  function remove() {
    if (!initial) {
      setForm(null);
      return;
    }
    if (!window.confirm('Remove this form? Buyers will no longer be asked these questions.')) return;
    setError(null);
    startTransition(async () => {
      try {
        await clientApi(`/organizer/events/${eventId}/form`, { method: 'DELETE' });
        setForm(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not remove the form');
      }
    });
  }

  if (!form) {
    return (
      <section className="card p-6">
        <h2 className="font-display text-xl text-ink">Registration form</h2>
        <p className="mt-1 max-w-2xl text-sm text-mute">
          Ask buyers questions before they pay, like runner details for a race or dietary needs for a
          dinner. They fill it in at checkout in the app and on the website, and you can download the
          answers as a spreadsheet.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={() => setForm({ ...BLANK, fields: BLANK.fields.map((f) => ({ ...f, id: newId() })) })}>
            + Add a form
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setForm({ ...RUNNER_TEMPLATE, fields: RUNNER_TEMPLATE.fields.map((f) => ({ ...f, id: newId() })) })}
          >
            Start from runner template
          </button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-primary">{error}</p>}
      </section>
    );
  }

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Registration form</h2>
          <p className="mt-1 text-sm text-mute">Buyers fill this in at checkout, before paying.</p>
        </div>
        {initial && (
          <a
            href={`/api/backend/organizer/events/${eventId}/form-responses.csv`}
            className="btn-ghost whitespace-nowrap"
            download
          >
            Download answers (CSV)
          </a>
        )}
      </div>

      {hasSales && (
        <p className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
          People have already registered, so existing questions can be reworded but not removed or changed to
          another type. New questions must be optional.
        </p>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label mb-1 block">Form name</label>
          <input
            className="input"
            value={form.name}
            maxLength={100}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="e.g. Runner details"
          />
        </div>
        <div className="md:col-span-2">
          <label className="label mb-1 block">Description</label>
          <textarea
            className="input min-h-[80px]"
            value={form.description}
            maxLength={1000}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="What buyers should know before filling it in"
          />
        </div>
        <div className="md:col-span-2">
          <span className="label mb-2 block">Ask this</span>
          <div className="flex flex-wrap gap-4 text-sm text-ink">
            {([
              [false, 'Once per registration'],
              [true, 'For every person registered (e.g. each runner)'],
            ] as const).map(([value, label]) => (
              <label key={label} className={`flex items-center gap-2 ${hasSales && initial ? 'opacity-60' : ''}`}>
                <input
                  type="radio"
                  name="perTicket"
                  checked={form.perTicket === value}
                  disabled={hasSales && !!initial}
                  onChange={() => update({ perTicket: value })}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {form.fields.map((f, i) => {
          const locked = lockedIds.has(f.id);
          return (
            <div key={f.id} className="rounded-xl border border-line bg-bg p-5">
              <div className="grid gap-4 md:grid-cols-6">
                <div className="md:col-span-3">
                  <label className="label mb-1 block">Question {i + 1}</label>
                  <input
                    className="input"
                    value={f.label}
                    maxLength={120}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    placeholder="e.g. T-shirt size"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label mb-1 block">Answer type</label>
                  <select
                    className="input disabled:opacity-60"
                    value={f.type}
                    disabled={locked}
                    onChange={(e) => {
                      const type = e.target.value as FormFieldType;
                      updateField(i, { type, options: isChoice(type) ? f.options ?? ['', ''] : undefined });
                    }}
                  >
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={f.required}
                      disabled={hasSales && !f.required}
                      onChange={(e) => updateField(i, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>
                {isChoice(f.type) && (
                  <div className="md:col-span-6">
                    <label className="label mb-1 block">Choices, one per line</label>
                    <textarea
                      className="input min-h-[90px]"
                      value={(f.options ?? []).join('\n')}
                      onChange={(e) => updateField(i, { options: e.target.value.split('\n') })}
                      placeholder={'S\nM\nL'}
                    />
                  </div>
                )}
                <div className="md:col-span-6">
                  <label className="label mb-1 block">Help text (optional)</label>
                  <input
                    className="input"
                    value={f.help ?? ''}
                    maxLength={200}
                    onChange={(e) => updateField(i, { help: e.target.value })}
                    placeholder="Shown under the question"
                  />
                </div>
                {form.perTicket && f.type !== 'image' && (
                  <label className="flex items-start gap-2 text-sm text-ink md:col-span-6">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={!!f.copyable}
                      onChange={(e) => updateField(i, { copyable: e.target.checked })}
                    />
                    <span>
                      Usually the same for the whole group
                      <span className="block text-xs text-mute">
                        People registering a group can copy this answer from Person 1 in one tap. Good for emergency
                        contact, town or club; not for name or date of birth.
                      </span>
                    </span>
                  </label>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-mute">
                <button type="button" className="hover:text-ink disabled:opacity-40" disabled={i === 0} onClick={() => moveField(i, -1)}>
                  ↑ Move up
                </button>
                <button
                  type="button"
                  className="hover:text-ink disabled:opacity-40"
                  disabled={i === form.fields.length - 1}
                  onClick={() => moveField(i, 1)}
                >
                  ↓ Move down
                </button>
                {form.fields.length > 1 && !locked && (
                  <button
                    type="button"
                    className="hover:text-primary"
                    onClick={() => update({ fields: form.fields.filter((_, j) => j !== i) })}
                  >
                    Remove question
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <button
          type="button"
          className="btn-ghost"
          disabled={form.fields.length >= 30}
          onClick={() =>
            update({ fields: [...form.fields, { id: newId(), label: '', type: 'short_text', required: !hasSales }] })
          }
        >
          + Add question
        </button>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-primary">{error}</p>}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {!(hasSales && initial) ? (
          <button type="button" className="text-xs text-mute hover:text-primary" disabled={busy} onClick={remove}>
            {initial ? 'Remove form' : 'Cancel'}
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-pine">Saved</span>}
          <button type="button" className="btn-primary" disabled={busy} onClick={save}>
            {busy ? 'Saving…' : 'Save form'}
          </button>
        </div>
      </div>
    </section>
  );
}
