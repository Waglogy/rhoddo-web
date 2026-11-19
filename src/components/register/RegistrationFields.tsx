'use client';

// A host's registration form, filled in by buyers before paying. Same rules as the
// app's src/components/RegistrationForm.tsx and the API's lib/eventForms.ts.

import { useState } from 'react';
import { localImagePreview, pickImage } from './formImages';

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
};

export type EventForm = {
  name: string;
  description: string;
  perTicket: boolean;
  fields: FormField[];
};

export type AnswerValue = string | number | boolean | string[];
export type FormAnswers = Record<string, AnswerValue>;

/** How many sets of answers the form needs for this many tickets. */
export function answerSetsNeeded(form: EventForm, qty: number): number {
  return form.perTicket ? qty : 1;
}

/** Grows or shrinks the answer list to match the ticket count, keeping what's filled in. */
export function resizeAnswers(answers: FormAnswers[], count: number): FormAnswers[] {
  return Array.from({ length: count }, (_, i) => answers[i] ?? {});
}

function isEmpty(v: AnswerValue | undefined): boolean {
  return v === undefined || v === false || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);
}

/** The first problem with the answers, worded for the buyer, or null when they're ready. */
export function firstFormError(form: EventForm, answers: FormAnswers[]): string | null {
  for (let i = 0; i < answers.length; i++) {
    const who = answers.length > 1 ? `Person ${i + 1}: ` : '';
    for (const f of form.fields) {
      const v = answers[i][f.id];
      if (isEmpty(v)) {
        if (f.required) return `${who}${f.type === 'checkbox' ? 'please tick' : 'fill in'} "${f.label}"`;
        continue;
      }
      const s = typeof v === 'string' ? v.trim() : '';
      if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return `${who}"${f.label}" isn't a valid email`;
      if (f.type === 'phone' && !/^\+?\d{10,15}$/.test(s.replace(/[\s()-]/g, ''))) {
        return `${who}"${f.label}" isn't a valid phone number`;
      }
      if (f.type === 'number' && !Number.isFinite(Number(s))) return `${who}"${f.label}" should be a number`;
      if (f.type === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s)))) {
        return `${who}enter a date for "${f.label}"`;
      }
    }
  }
  return null;
}

export function RegistrationFields({
  form,
  answers,
  onChange,
  disabled,
}: {
  form: EventForm;
  answers: FormAnswers[];
  onChange: (answers: FormAnswers[]) => void;
  disabled?: boolean;
}) {
  const setAnswer = (index: number, fieldId: string, value: AnswerValue) => {
    onChange(answers.map((a, i) => (i === index ? { ...a, [fieldId]: value } : a)));
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="font-display text-xl text-ink">{form.name}</div>
        {!!form.description && <p className="mt-1 whitespace-pre-line text-sm text-mute">{form.description}</p>}
      </div>
      {answers.map((set, i) => (
        <fieldset key={i} className="space-y-4 rounded-2xl border border-line p-4" disabled={disabled}>
          {answers.length > 1 && <legend className="px-1 text-sm font-medium text-gold">Person {i + 1}</legend>}
          {form.fields.map((f) => (
            <FieldInput key={f.id} id={`${i}-${f.id}`} field={f} value={set[f.id]} onChange={(v) => setAnswer(i, f.id, v)} />
          ))}
        </fieldset>
      ))}
    </div>
  );
}

function FieldInput({
  id,
  field,
  value,
  onChange,
}: {
  id: string;
  field: FormField;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}) {
  const required = field.required && <span className="text-primary"> *</span>;
  const help = field.help && <p className="mt-1 text-xs text-mute">{field.help}</p>;

  if (field.type === 'image') {
    return <ImageInput id={id} field={field} value={value} onChange={onChange} required={required} help={help} />;
  }

  if (field.type === 'checkbox') {
    return (
      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-[rgb(var(--primary))]"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>
            {field.label}
            {required}
          </span>
        </label>
        {help}
      </div>
    );
  }

  if (field.type === 'select' || field.type === 'multi_select') {
    const multi = field.type === 'multi_select';
    const selected = multi ? (Array.isArray(value) ? value : []) : typeof value === 'string' ? [value] : [];
    return (
      <div role="group" aria-labelledby={`${id}-label`}>
        <div id={`${id}-label`} className="mb-2 text-sm font-medium text-ink">
          {field.label}
          {required}
        </div>
        <div className="flex flex-wrap gap-2">
          {(field.options ?? []).map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                role={multi ? 'checkbox' : 'radio'}
                aria-checked={on}
                onClick={() =>
                  onChange(multi ? (on ? selected.filter((o) => o !== opt) : [...selected, opt]) : on && !field.required ? '' : opt)
                }
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  on ? 'border-primary bg-primary/10 text-ink' : 'border-line text-mute hover:border-ink/30'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {help}
      </div>
    );
  }

  const text = typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
  const common = {
    id,
    className: 'input',
    value: text,
    required: field.required,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {field.label}
        {required}
      </label>
      {field.type === 'long_text' ? (
        <textarea {...common} rows={4} maxLength={2000} />
      ) : (
        <input
          {...common}
          type={
            field.type === 'number'
              ? 'number'
              : field.type === 'date'
                ? 'date'
                : field.type === 'email'
                  ? 'email'
                  : field.type === 'phone'
                    ? 'tel'
                    : 'text'
          }
          inputMode={field.type === 'number' ? 'decimal' : undefined}
          autoComplete={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : undefined}
          placeholder={field.type === 'phone' ? '+91 98765 43210' : field.type === 'email' ? 'name@example.com' : undefined}
          maxLength={200}
        />
      )}
      {help}
    </div>
  );
}

function ImageInput({
  id,
  field,
  value,
  onChange,
  required,
  help,
}: {
  id: string;
  field: FormField;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  required: React.ReactNode;
  help: React.ReactNode;
}) {
  const [problem, setProblem] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const preview = localImagePreview(value);
  const chosen = typeof value === 'string' && value !== '';

  async function choose(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same photo be chosen again
    if (!file) return;
    setProblem(null);
    setWorking(true);
    try {
      onChange(await pickImage(file));
    } catch (err) {
      setProblem(err instanceof Error ? err.message : 'Could not use that photo');
    } finally {
      setWorking(false);
    }
  }

  return (
    <div>
      <div id={`${id}-label`} className="mb-1.5 text-sm font-medium text-ink">
        {field.label}
        {required}
      </div>
      <div className="flex items-center gap-3">
        {chosen && (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-panel">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] text-mute">Photo</div>
            )}
          </div>
        )}
        <label className="btn-ghost cursor-pointer whitespace-nowrap">
          {working ? 'Preparing…' : chosen ? 'Change photo' : 'Choose photo'}
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="sr-only"
            aria-labelledby={`${id}-label`}
            onChange={choose}
            disabled={working}
          />
        </label>
        {chosen && !working && (
          <button type="button" className="text-xs text-mute underline hover:text-ink" onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      {problem && <p role="alert" className="mt-1 text-xs text-primary">{problem}</p>}
      {help}
      <p className="mt-1 text-[11px] text-mute">Only the organiser can see this photo.</p>
    </div>
  );
}
