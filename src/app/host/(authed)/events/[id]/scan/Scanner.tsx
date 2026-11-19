'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// Outcome of a single check-in attempt, used by the result banner.
type ScanResult =
  | {
      kind: 'ok';
      attendeeName: string;
      tierName: string;
      ticketNumber: string;
      eventTitle: string;
      checkedInAt: string;
    }
  | {
      kind: 'error';
      reason: string;
      message: string;
      attendeeName?: string;
      tierName?: string;
      ticketNumber?: string;
      originalCheckInAt?: string;
    };

type Stats = { total: number; checkedIn: number };

type Props = {
  eventId: string;
  initialStats: Stats;
};

// The camera element has to have a stable DOM id that html5-qrcode can hook into.
const READER_ID = 'rhoddo-qr-reader';

// Cooldown between accepted scans so a single QR doesn't spam the endpoint
// while the camera keeps decoding the same frame.
const SCAN_COOLDOWN_MS = 2000;

export function Scanner({ eventId, initialStats }: Props) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');

  // Refs (not state) for things we don't want to trigger re-renders on.
  const qrRef = useRef<Html5Qrcode | null>(null);
  const lastCodeRef = useRef<string | null>(null);
  const lastCodeAtRef = useRef<number>(0);
  const busyRef = useRef<boolean>(false);

  // ---------- Beep sound ----------
  // Tiny WebAudio tone — no asset file, works offline.
  const beep = useCallback((ok: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = ok ? 880 : 220;
      gain.gain.value = 0.15;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (ok ? 0.12 : 0.25));
    } catch {
      // Audio is a nice-to-have — ignore failures.
    }
  }, []);

  // ---------- Refresh stats after a successful scan ----------
  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/host/scan/stats/${eventId}`, { cache: 'no-store' });
      if (res.ok) setStats(await res.json());
    } catch {
      // Non-fatal — the counter just won't update this tick.
    }
  }, [eventId]);

  // ---------- Submit a scanned code to the backend ----------
  const submitCode = useCallback(
    async (code: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        const res = await fetch('/api/host/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, eventId }),
        });
        const data = await res.json();

        if (res.ok && data?.status === 'ok') {
          setResult({
            kind: 'ok',
            attendeeName: data.attendeeName,
            tierName: data.tierName,
            ticketNumber: data.ticketNumber,
            eventTitle: data.eventTitle,
            checkedInAt: data.checkedInAt,
          });
          beep(true);
          refreshStats();
        } else {
          setResult({
            kind: 'error',
            reason: data?.reason || 'unknown',
            message: data?.error || 'Check-in failed',
            attendeeName: data?.attendeeName,
            tierName: data?.tierName,
            ticketNumber: data?.ticketNumber,
            originalCheckInAt: data?.originalCheckInAt,
          });
          beep(false);
        }
      } catch (e: any) {
        setResult({
          kind: 'error',
          reason: 'network',
          message: e?.message || 'Network error',
        });
        beep(false);
      } finally {
        busyRef.current = false;
      }
    },
    [eventId, beep, refreshStats],
  );

  // ---------- html5-qrcode callback ----------
  const onDecode = useCallback(
    (decodedText: string) => {
      const now = Date.now();
      // Debounce: ignore the same code within the cooldown window.
      if (
        decodedText === lastCodeRef.current &&
        now - lastCodeAtRef.current < SCAN_COOLDOWN_MS
      ) {
        return;
      }
      lastCodeRef.current = decodedText;
      lastCodeAtRef.current = now;
      submitCode(decodedText.trim());
    },
    [submitCode],
  );

  // ---------- Start / stop the camera ----------
  const startCamera = useCallback(async () => {
    setError(null);
    if (qrRef.current) return;
    try {
      const q = new Html5Qrcode(READER_ID, /* verbose */ false);
      qrRef.current = q;
      await q.start(
        { facingMode: 'environment' }, // rear camera on phones; falls back to any camera
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        onDecode,
        // Per-frame decode failures happen constantly — ignore.
        () => {},
      );
      setCameraOn(true);
    } catch (e: any) {
      qrRef.current = null;
      setCameraOn(false);
      setError(
        e?.message ||
          'Could not open the camera. Grant camera permission in your browser and try again.',
      );
    }
  }, [onDecode]);

  const stopCamera = useCallback(async () => {
    const q = qrRef.current;
    if (!q) return;
    try {
      await q.stop();
      await q.clear();
    } catch {
      // ignore
    }
    qrRef.current = null;
    setCameraOn(false);
  }, []);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // ---------- Manual entry fallback ----------
  const submitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    setManualCode('');
    await submitCode(code);
  };

  // ---------- Render ----------
  const pct =
    stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Counter */}
      <div className="card p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="label">Checked in</div>
            <div className="font-display text-4xl text-ink">
              {stats.checkedIn}
              <span className="text-mute"> / {stats.total}</span>
            </div>
          </div>
          <div className="font-display text-2xl text-gold">{pct}%</div>
        </div>
        <div className="mt-4 h-1.5 w-full rounded-full bg-line">
          <div
            className="h-1.5 rounded-full bg-gold transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Camera view */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="label">Scanner</div>
          {cameraOn ? (
            <button onClick={stopCamera} className="btn-ghost text-xs">
              Stop camera
            </button>
          ) : (
            <button onClick={startCamera} className="btn-primary text-xs">
              Start camera
            </button>
          )}
        </div>

        <div
          id={READER_ID}
          className="mx-auto w-full max-w-md overflow-hidden rounded-lg bg-bg"
          style={{ minHeight: cameraOn ? 260 : 0 }}
        />

        {!cameraOn && !error && (
          <p className="mt-4 text-center text-sm text-mute">
            Tap &ldquo;Start camera&rdquo; and allow camera access. Works on any phone or laptop.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 [html[data-theme=dark]_&]:text-red-300">
            {error}
          </p>
        )}
      </div>

      {/* Result banner */}
      {result && <ResultBanner result={result} onDismiss={() => setResult(null)} />}

      {/* Manual entry fallback */}
      <details className="card p-5">
        <summary className="cursor-pointer text-sm text-mute hover:text-gold">
          Can&apos;t scan? Enter the code manually
        </summary>
        <form onSubmit={submitManual} className="mt-4 flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="T-XXXXXXXXXXXX"
            className="input flex-1"
            autoCapitalize="characters"
          />
          <button type="submit" className="btn-primary">
            Check in
          </button>
        </form>
      </details>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────

function ResultBanner({
  result,
  onDismiss,
}: {
  result: ScanResult;
  onDismiss: () => void;
}) {
  if (result.kind === 'ok') {
    return (
      <div className="rounded-lg border border-emerald-500/60 bg-emerald-500/15 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="label text-emerald-800 [html[data-theme=dark]_&]:text-emerald-300">Admit</div>
            <div className="mt-1 font-display text-2xl text-ink">{result.attendeeName}</div>
            <div className="mt-1 text-sm text-mute">
              {result.tierName} · Pass {result.ticketNumber}
            </div>
          </div>
          <button onClick={onDismiss} className="btn-ghost text-xs">
            Clear
          </button>
        </div>
      </div>
    );
  }

  const tone = toneForReason(result.reason);
  return (
    <div
      className={`rounded-lg border p-5 ${
        tone === 'hard'
          ? 'border-red-500/60 bg-red-500/15'
          : 'border-amber-500/60 bg-amber-500/15'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className={`label ${tone === 'hard' ? 'text-red-700 [html[data-theme=dark]_&]:text-red-300' : 'text-amber-800 [html[data-theme=dark]_&]:text-amber-300'}`}>
            {labelForReason(result.reason)}
          </div>
          <div className="mt-1 font-display text-2xl text-ink">{result.message}</div>
          {result.attendeeName && (
            <div className="mt-2 text-sm text-mute">
              {result.attendeeName}
              {result.tierName ? ` · ${result.tierName}` : ''}
              {result.ticketNumber ? ` · Pass ${result.ticketNumber}` : ''}
            </div>
          )}
          {result.originalCheckInAt && (
            <div className="mt-1 text-xs text-mute">
              Originally scanned: {new Date(result.originalCheckInAt).toLocaleString()}
            </div>
          )}
        </div>
        <button onClick={onDismiss} className="btn-ghost text-xs">
          Clear
        </button>
      </div>
    </div>
  );
}

function labelForReason(reason: string): string {
  switch (reason) {
    case 'already_checked_in':
      return 'Already used';
    case 'wrong_event':
      return 'Wrong event';
    case 'cancelled_or_refunded':
      return 'Cancelled or refunded';
    case 'not_your_event':
      return 'Not your event';
    case 'invalid_code':
      return 'Invalid code';
    case 'unauthorized':
      return 'Not logged in';
    case 'network':
      return 'Network error';
    default:
      return 'Deny';
  }
}

function toneForReason(reason: string): 'hard' | 'soft' {
  // Soft = something the organizer might explain away (wrong event, already used).
  // Hard = outright forgery / invalid code.
  if (reason === 'wrong_event' || reason === 'already_checked_in') return 'soft';
  return 'hard';
}
