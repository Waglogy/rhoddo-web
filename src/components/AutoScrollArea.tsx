"use client";

import { useEffect, useRef, type HTMLAttributes } from 'react';

const SPEED_PX_PER_SECOND = 28;
const PAUSE_AT_ENDS_MS = 3500;
const RESUME_AFTER_INTERACTION_MS = 2500;

/**
 * A scroll area that slowly scrolls itself, then glides back to the top and repeats.
 * It stops while someone hovers, touches or focuses it so they can scroll by hand,
 * and it stays still for people who've asked their device to reduce motion.
 */
export function AutoScrollArea(props: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let lastTime = 0;
    let position = el.scrollTop;
    let waitUntil = performance.now() + PAUSE_AT_ENDS_MS;
    let interacting = false;
    let onScreen = true;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const elapsed = Math.min(now - lastTime, 100);
      lastTime = now;
      if (interacting || !onScreen || now < waitUntil) {
        position = el.scrollTop; // carry on from wherever they scrolled to
        return;
      }

      const end = el.scrollHeight - el.clientHeight;
      if (end <= 0) return;
      if (position >= end - 1) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
        waitUntil = now + PAUSE_AT_ENDS_MS * 2;
        position = 0;
        return;
      }
      if (position === 0 && el.scrollTop > 1) {
        // Still gliding back to the top.
        waitUntil = now + 200;
        return;
      }
      // scrollTop rounds to whole pixels, so keep the exact position separately.
      position += (SPEED_PX_PER_SECOND * elapsed) / 1000;
      el.scrollTop = position;
    };

    const pause = () => {
      interacting = true;
    };
    const resume = () => {
      interacting = false;
      waitUntil = performance.now() + RESUME_AFTER_INTERACTION_MS;
    };
    const nudge = () => {
      waitUntil = performance.now() + RESUME_AFTER_INTERACTION_MS;
    };

    el.addEventListener('pointerenter', pause);
    el.addEventListener('pointerleave', resume);
    el.addEventListener('focusin', pause);
    el.addEventListener('focusout', resume);
    el.addEventListener('touchstart', nudge, { passive: true });
    el.addEventListener('touchmove', nudge, { passive: true });
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    observer.observe(el);

    frame = requestAnimationFrame((now) => {
      lastTime = now;
      tick(now);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener('pointerenter', pause);
      el.removeEventListener('pointerleave', resume);
      el.removeEventListener('focusin', pause);
      el.removeEventListener('focusout', resume);
      el.removeEventListener('touchstart', nudge);
      el.removeEventListener('touchmove', nudge);
    };
  }, []);

  return <div ref={ref} {...props} />;
}
