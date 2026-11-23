'use client';

import { useState } from 'react';

// Hosts write "About" as plain text. This turns the usual shapes into a readable page:
//   RACES / Registration:   -> a heading (a short line in capitals, or ending with ":")
//   • 21 km: Tashi to ...   -> a bullet, with the part before ":" in bold
//   lines next to each other -> a list, one item per line (hosts put one fact per line)
//   a line on its own       -> a paragraph
// Nothing the host wrote is dropped or reordered.

type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'para'; text: string };

const BULLET = /^\s*(?:[•●▪◦*-]|\d+[.)])\s+/;

function isHeading(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 60 || BULLET.test(t)) return false;
  // A note in brackets after a capitals heading is fine: "CATEGORIES (age on race day)".
  const bare = t.replace(/\s*\([^)]*\)\s*$/, '');
  if (bare.length > 48) return false;
  const letters = bare.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 3 && letters === letters.toUpperCase()) return true; // RACES
  const lead = t.match(/^([^:]{3,30}):\s/)?.[1]; // CASH PRIZES: ₹4,12,000 in total
  if (lead && t.length <= 60) {
    const leadLetters = lead.replace(/[^A-Za-z]/g, '');
    if (leadLetters.length >= 3 && leadLetters === leadLetters.toUpperCase()) return true;
  }
  return /:$/.test(t) && t.split(/\s+/).length <= 5; // "Registration:"
}

export function parseAbout(text: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    // One line is a paragraph; several lines in a row are a list of facts, one per line.
    if (para.length === 1) blocks.push({ kind: 'para', text: para[0] });
    else if (para.length > 1) blocks.push({ kind: 'list', items: para });
    para = [];
  };
  for (const raw of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (BULLET.test(line)) {
      flush();
      const item = line.replace(BULLET, '');
      const last = blocks[blocks.length - 1];
      if (last?.kind === 'list') last.items.push(item);
      else blocks.push({ kind: 'list', items: [item] });
      continue;
    }
    if (isHeading(line)) {
      flush();
      blocks.push({ kind: 'heading', text: line.replace(/:$/, '') });
      continue;
    }
    para.push(line);
  }
  flush();
  return blocks;
}

/** "21 km Open: ₹40,000 / …" shows the label in bold. Only short labels, so sentences with a colon stay plain. */
function Item({ text }: { text: string }) {
  const m = text.match(/^([^:]{2,40}):\s+(.+)$/);
  if (!m) return <>{text}</>;
  return (
    <>
      <span className="font-medium text-ink">{m[1]}</span>
      <span className="text-mute">: </span>
      {m[2]}
    </>
  );
}

function sentenceCase(s: string): string {
  // RACES -> Races; CASH PRIZES: ₹4,12,000 in total -> Cash prizes: ₹4,12,000 in total
  // A note in brackets keeps its own case: "CATEGORIES (age on race day)" -> "Categories (age on race day)".
  const paren = s.match(/^(.*?)(\s*\([^)]*\))$/);
  if (paren) return sentenceCase(paren[1]) + paren[2];
  const m = s.match(/^([^:]+)(:.*)?$/)!;
  const head = m[1];
  const letters = head.replace(/[^A-Za-z]/g, '');
  if (letters !== letters.toUpperCase()) return s;
  const lower = head.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1) + (m[2] ?? '');
}

const COLLAPSE_AT = 900; // characters

export function AboutText({ text }: { text: string }) {
  const blocks = parseAbout(text);
  const long = text.length > COLLAPSE_AT;
  const [open, setOpen] = useState(!long);

  return (
    <div>
      <div
        className={`relative space-y-4 text-[15px] leading-relaxed text-ink/90 ${open ? '' : 'max-h-[22rem] overflow-hidden'}`}
      >
        {blocks.map((b, i) =>
          b.kind === 'heading' ? (
            <h3 key={i} className="flex items-center gap-2 pt-2 font-display text-xl text-ink">
              <span className="h-5 w-1 rounded-full bg-primary" aria-hidden />
              {sentenceCase(b.text)}
            </h3>
          ) : b.kind === 'list' ? (
            <ul key={i} className="space-y-2">
              {b.items.map((item, j) => (
                <li key={j} className="flex gap-3 rounded-xl border border-line bg-panel px-4 py-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  <span className="min-w-0">
                    <Item text={item} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p key={i}>{b.text}</p>
          ),
        )}
        {!open && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />}
      </div>
      {long && (
        <button type="button" className="mt-3 text-sm font-medium text-primary hover:underline" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
