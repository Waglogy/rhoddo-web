'use client';

// On Android this opens the event in the Rhoddo app, or the Play Store if the app isn't
// installed. Elsewhere it goes to the Play Store (there's no iPhone app yet).

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rhoddo.app';

export function OpenInAppButton({ eventId, className }: { eventId: string; className?: string }) {
  return (
    <a
      href={PLAY_STORE_URL}
      className={className}
      onClick={(e) => {
        if (!/android/i.test(navigator.userAgent)) return;
        e.preventDefault();
        window.location.href = `intent://event/${encodeURIComponent(eventId)}#Intent;scheme=rhoddo;package=com.rhoddo.app;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;
      }}
    >
      View in app
    </a>
  );
}
