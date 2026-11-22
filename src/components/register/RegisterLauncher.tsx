'use client';

// Registration opens as a step-by-step popup over the event page: full screen on phones,
// a centred dialog on larger screens. Any <RegisterButton> on the page opens it (optionally
// with a pass already picked). It stays mounted while closed, so nothing typed is lost.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Buyer } from '@/lib/buyerApi';
import { RegisterPanel, type RegisterEvent } from './RegisterPanel';

const OPEN_EVENT = 'rhoddo:register';

/** Opens the registration popup, optionally with this pass picked. */
export function openRegistration(tierId?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { tierId } }));
}

export function RegisterButton({
  tierId,
  className = 'btn-primary w-full py-3.5 text-base',
  children,
  disabled,
}: {
  tierId?: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button type="button" className={className} disabled={disabled} onClick={() => openRegistration(tierId)}>
      {children}
    </button>
  );
}

export function RegisterLauncher({
  event,
  initialUser,
  priceLabel,
  actionLabel,
  soldOutLabel,
}: {
  event: RegisterEvent;
  initialUser: Buyer | null;
  /** e.g. "From ₹500" */
  priceLabel: string;
  /** e.g. "Register now" */
  actionLabel: string;
  /** Shown instead of the action when every pass is gone, e.g. "Registration full". */
  soldOutLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [tierId, setTierId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const soldOut = event.tiers.every((t) => t.left <= 0);

  const close = useCallback(() => {
    setOpen(false);
    openerRef.current?.focus?.();
  }, []);

  useEffect(() => {
    // Registering needs a Rhoddo account: signed-out visitors sign in or sign up first,
    // then come back here with the popup open and their pass still picked.
    const signInFirst = (pass?: string | null) => {
      const back = new URL(window.location.href);
      back.hash = 'register';
      if (pass) back.searchParams.set('pass', pass);
      else back.searchParams.delete('pass');
      window.location.assign(`/signin?next=${encodeURIComponent(back.pathname + back.search + back.hash)}`);
    };
    const onOpen = (e: Event) => {
      const pass = (e as CustomEvent<{ tierId?: string }>).detail?.tierId ?? null;
      if (!initialUser) return signInFirst(pass);
      openerRef.current = document.activeElement as HTMLElement | null;
      setTierId(pass);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    // Links shared as rhoddo.com/r/<name>#register open straight into registration.
    if (window.location.hash === '#register' && !soldOut) {
      const pass = new URLSearchParams(window.location.search).get('pass');
      if (!initialUser) signInFirst(pass);
      else {
        setTierId(pass);
        setOpen(true);
      }
    }
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [soldOut, initialUser]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <>
      {/* Phones: a bar fixed to the bottom of the screen */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-mute">Entry</div>
            <div className="truncate font-display text-xl text-ink">{priceLabel}</div>
          </div>
          <button
            type="button"
            className="btn-primary flex-1 py-3.5 text-base"
            disabled={soldOut}
            onClick={() => openRegistration()}
          >
            {soldOut ? soldOutLabel : actionLabel}
          </button>
        </div>
      </div>

      {/* The popup */}
      <div
        className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none invisible'}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={close}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-title"
          className={`absolute inset-0 flex flex-col bg-panel transition-all duration-200 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[min(90dvh,780px)] sm:w-[min(92vw,520px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-hidden sm:rounded-3xl sm:border sm:border-line sm:shadow-2xl ${
            open ? 'translate-y-0 opacity-100 sm:scale-100' : 'translate-y-6 opacity-0 sm:scale-95'
          }`}
        >
          <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
            <div className="min-w-0">
              <div className="label">{actionLabel.replace(/ now$/i, '')}</div>
              <h2 id="register-title" className="truncate font-display text-lg text-ink">
                {event.title}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink transition hover:bg-bg"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 pb-[env(safe-area-inset-bottom)]">
            <RegisterPanel event={event} initialUser={initialUser} preferredTierId={tierId} />
          </div>
        </div>
      </div>
    </>
  );
}
