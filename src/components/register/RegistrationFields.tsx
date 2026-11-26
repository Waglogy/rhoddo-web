'use client';

// A host's registration form, filled in by buyers before paying. Same rules as the
// app's src/components/RegistrationForm.tsx and the API's lib/eventForms.ts.

import { useState } from 'react';
import { localFileName, localImagePreview, pickFile, pickImage } from './formImages';

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
  | 'image'
  | 'file';

export type FormField = {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  help?: string;
  options?: string[];
  copyable?: boolean;
  /** The date of birth question, used for age rules. */
  dob?: boolean;
  /** Only asked to people under 18, or 18 and over, on the event day. */
  showIf?: 'under18' | 'adult';
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

/** Age rules for one registration: the event day and the chosen pass's minimum age. */
export type AgeRules = { eventDate?: string; minAge?: number | null; passName?: string };

const ADULT_AGE = 18;
const isUpload = (t: FormFieldType) => t === 'image' || t === 'file';

/** Age in whole years on the event day (in India), from a YYYY-MM-DD date of birth. Same as the API. */
export function ageOn(dob: unknown, eventDate: string | undefined): number | null {
  if (!eventDate || typeof dob !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const [by, bm, bd] = dob.split('-').map(Number);
  const day = new Date(new Date(eventDate).getTime() + 330 * 60 * 1000).toISOString().slice(0, 10);
  const [y, m, d] = day.split('-').map(Number);
  let age = y - by;
  if (m < bm || (m === bm && d < bd)) age -= 1;
  return age;
}

/** This person's age on the event day, from the form's date of birth question. */
export function personAge(form: EventForm, set: FormAnswers, eventDate?: string): number | null {
  const dob = form.fields.find((f) => f.dob);
  return dob ? ageOn(set[dob.id], eventDate) : null;
}

/** Whether a question is asked to someone of this age. Age questions wait for the date of birth. */
export function fieldApplies(field: FormField, age: number | null): boolean {
  if (!field.showIf) return true;
  if (age === null) return false;
  return field.showIf === 'under18' ? age < ADULT_AGE : age >= ADULT_AGE;
}

/** The answers without questions this person isn't asked (e.g. under-18 consent for an adult). */
export function applicableAnswers(form: EventForm, answers: FormAnswers[], eventDate?: string): FormAnswers[] {
  return answers.map((set) => {
    const age = personAge(form, set, eventDate);
    const out: FormAnswers = {};
    for (const f of form.fields) if (fieldApplies(f, age) && set[f.id] !== undefined) out[f.id] = set[f.id];
    return out;
  });
}

/** A problem with a date of birth for this pass, or null. */
function ageProblem(age: number | null, rules: AgeRules): string | null {
  if (age === null) return null;
  if (age < 0 || age > 110) return 'enter a real date of birth';
  if (rules.minAge && age < rules.minAge) {
    return `${rules.passName ? `the ${rules.passName} pass` : 'this pass'} is for ages ${rules.minAge}+ on the event day (this person will be ${age})`;
  }
  return null;
}

function isEmpty(v: AnswerValue | undefined): boolean {
  return v === undefined || v === false || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);
}

/** One problem with an answer: which field (for highlighting it) and what to say. */
export type FormProblem = { key: string; message: string; full: string };

/** The page id of a person's field, for scrolling to it. */
export const fieldDomId = (index: number, fieldId: string) => `reg-field-${index}-${fieldId}`;

/** What's wrong with one answer, worded for the person filling it in, or null. */
function answerProblem(f: FormField, v: AnswerValue | undefined): string | null {
  if (isEmpty(v)) {
    if (!f.required) return null;
    if (f.type === 'checkbox') return 'Please tick this box to continue';
    if (f.type === 'image' || f.type === 'file') return 'Please upload this';
    if (f.type === 'select' || f.type === 'multi_select') return 'Please choose an option';
    return 'This is required';
  }
  const s = typeof v === 'string' ? v.trim() : '';
  if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'Enter a valid email address';
  if (f.type === 'phone' && !/^\+?\d{10,15}$/.test(s.replace(/[\s()-]/g, ''))) return 'Enter a valid phone number (10 digits)';
  if (f.type === 'number' && !Number.isFinite(Number(s))) return 'Enter a number';
  if (f.type === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s)))) return 'Enter a date';
  return null;
}

/** Every problem with the answers, in the order they appear on the page. */
export function formProblems(form: EventForm, answers: FormAnswers[], rules: AgeRules = {}): FormProblem[] {
  const out: FormProblem[] = [];
  for (let i = 0; i < answers.length; i++) {
    const who = answers.length > 1 ? `Person ${i + 1}: ` : '';
    const age = personAge(form, answers[i], rules.eventDate);
    const tooYoung = ageProblem(age, rules);
    for (const f of form.fields) {
      if (!fieldApplies(f, age)) continue;
      let message = answerProblem(f, answers[i][f.id]);
      if (!message && f.dob && tooYoung) message = tooYoung.charAt(0).toUpperCase() + tooYoung.slice(1);
      if (message) out.push({ key: fieldDomId(i, f.id), message, full: `${who}${f.label}: ${message.charAt(0).toLowerCase()}${message.slice(1)}` });
    }
  }
  return out;
}

/** The first problem with the answers, worded for the buyer, or null when they're ready. */
export function firstFormError(form: EventForm, answers: FormAnswers[], rules: AgeRules = {}): string | null {
  return formProblems(form, answers, rules)[0]?.full ?? null;
}

export function RegistrationFields({
  form,
  answers,
  onChange,
  disabled,
  rules = {},
  consentFormUrl,
  showErrors = false,
}: {
  form: EventForm;
  answers: FormAnswers[];
  onChange: (answers: FormAnswers[]) => void;
  disabled?: boolean;
  /** Event day and the pass's minimum age, for questions that depend on age. */
  rules?: AgeRules;
  /** The host's printable consent form, offered to under-18s. */
  consentFormUrl?: string | null;
  /** After a failed "Continue": show what's missing or wrong under each field. */
  showErrors?: boolean;
}) {
  const setAnswer = (index: number, fieldId: string, value: AnswerValue) => {
    onChange(answers.map((a, i) => (i === index ? { ...a, [fieldId]: value } : a)));
  };
  // Questions the host marked "usually the same for the whole group".
  const copyable = form.fields.filter((f) => f.copyable && !isUpload(f.type));
  const hasAgeQuestions = form.fields.some((f) => f.showIf);
  const errors = new Map(showErrors ? formProblems(form, answers, rules).map((p) => [p.key, p.message]) : []);
  const copyFromFirst = (index: number) => {
    const first = answers[0] ?? {};
    const copied: FormAnswers = {};
    for (const f of copyable) if (first[f.id] !== undefined) copied[f.id] = first[f.id];
    onChange(answers.map((a, i) => (i === index ? { ...a, ...copied } : a)));
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="font-display text-xl text-ink">{form.name}</div>
        {!!form.description && <p className="mt-1 whitespace-pre-line text-sm text-mute">{form.description}</p>}
        <p className="mt-2 text-xs text-mute">
          🔒 Only the organiser and Rhoddo can see these answers and photos. They&apos;re deleted 30 days after the
          event.{' '}
          <a href="/privacy" target="_blank" className="underline hover:text-ink">
            Privacy policy
          </a>
        </p>
      </div>
      {answers.map((set, i) => (
        <fieldset key={i} className="space-y-4 rounded-2xl border border-line p-4" disabled={disabled}>
          {answers.length > 1 && <legend className="px-1 text-sm font-medium text-gold">Person {i + 1}</legend>}
          {i > 0 && copyable.length > 0 && (
            <button
              type="button"
              className="btn-ghost w-full text-sm"
              onClick={() => copyFromFirst(i)}
              title={`Copies: ${copyable.map((f) => f.label).join(', ')}`}
            >
              Same as Person 1 ({copyable.map((f) => f.label).join(', ')})
            </button>
          )}
          <PersonFields
            form={form}
            set={set}
            index={i}
            rules={rules}
            consentFormUrl={consentFormUrl}
            hasAgeQuestions={hasAgeQuestions}
            errors={errors}
            onAnswer={(fieldId, v) => setAnswer(i, fieldId, v)}
          />
        </fieldset>
      ))}
    </div>
  );
}

/** One person's questions. Under-18 questions appear once their date of birth shows they're under 18. */
function PersonFields({
  form,
  set,
  index,
  rules,
  consentFormUrl,
  hasAgeQuestions,
  errors,
  onAnswer,
}: {
  form: EventForm;
  set: FormAnswers;
  index: number;
  rules: AgeRules;
  consentFormUrl?: string | null;
  hasAgeQuestions: boolean;
  errors: Map<string, string>;
  onAnswer: (fieldId: string, value: AnswerValue) => void;
}) {
  const age = personAge(form, set, rules.eventDate);
  const problem = ageProblem(age, rules);
  const minor = age !== null && age >= 0 && age < ADULT_AGE;
  const firstMinorField = form.fields.find((f) => f.showIf === 'under18');
  return (
    <>
      {form.fields.map((f) => {
        if (!fieldApplies(f, age)) return null;
        return (
          <div key={f.id} id={fieldDomId(index, f.id)} className="scroll-mt-6 space-y-3">
            {minor && f === firstMinorField && (
              <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-ink">
                <div className="font-medium">This person is under 18 ({age} on the event day)</div>
                <p className="mt-1 text-mute">
                  A parent or guardian must give consent.
                  {consentFormUrl ? ' Download the consent form, have it signed, then upload a photo or PDF of it below.' : ''}
                </p>
                {consentFormUrl && (
                  <a
                    href={consentFormUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="btn-ghost mt-3 inline-flex items-center gap-2 text-sm"
                  >
                    ⬇ Download consent form (PDF)
                  </a>
                )}
              </div>
            )}
            {(() => {
              const error = errors.get(fieldDomId(index, f.id));
              return (
                <div
                  className={error ? 'rounded-xl border border-primary/60 bg-primary/5 p-3 [&_.input]:border-primary' : ''}
                  aria-invalid={error ? true : undefined}
                >
                  <FieldInput id={`${index}-${f.id}`} field={f} value={set[f.id]} onChange={(v) => onAnswer(f.id, v)} />
                  {error && !(f.dob && problem) && (
                    <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-primary">
                      <span aria-hidden>⚠</span> {error}
                    </p>
                  )}
                </div>
              );
            })()}
            {f.dob && problem && (
              <p role="alert" className="-mt-1 text-xs text-primary">
                {problem.charAt(0).toUpperCase() + problem.slice(1)}. Go back and choose another pass.
              </p>
            )}
            {f.dob && !problem && age !== null && (
              <p className="-mt-1 text-xs text-mute">
                Age on the event day: {age}
                {hasAgeQuestions && minor ? ' · parent or guardian consent needed' : ''}
              </p>
            )}
          </div>
        );
      })}
    </>
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

  if (isUpload(field.type)) {
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
  const fileName = localFileName(value);
  const chosen = typeof value === 'string' && value !== '';
  const allowPdf = field.type === 'file';
  const isPdf = chosen && !preview && /\.pdf$/i.test(fileName ?? '');

  async function choose(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same photo be chosen again
    if (!file) return;
    setProblem(null);
    setWorking(true);
    try {
      onChange(await (allowPdf ? pickFile(file) : pickImage(file)));
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
              <div className="flex h-full items-center justify-center text-[10px] text-mute">{isPdf ? '📄 PDF' : 'Photo'}</div>
            )}
          </div>
        )}
        <label className="btn-ghost relative cursor-pointer whitespace-nowrap">
          {working ? 'Preparing…' : chosen ? (allowPdf ? 'Change file' : 'Change photo') : allowPdf ? 'Choose photo or PDF' : 'Choose photo'}
          <input
            id={id}
            type="file"
            accept={`image/jpeg,image/png,image/webp,image/heic,image/heif${allowPdf ? ',application/pdf' : ''}`}
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
      {chosen && fileName && <p className="mt-1 truncate text-xs text-mute">{fileName}</p>}
      {problem && <p role="alert" className="mt-1 text-xs text-primary">{problem}</p>}
      {help}
      <p className="mt-1 text-[11px] text-mute">Only the organiser can see this {allowPdf ? 'file' : 'photo'}.</p>
    </div>
  );
}
