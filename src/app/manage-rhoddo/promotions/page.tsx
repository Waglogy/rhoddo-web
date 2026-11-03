import { api } from '@/lib/api';
import { PromotionsClient, type EventOption, type PromoSlide } from './PromotionsClient';

export default async function PromotionsPage() {
  const [promos, events] = await Promise.all([
    api<{ promos: PromoSlide[] }>('/admin/promos'),
    api<{ events: Array<EventOption & { published: boolean; date: string }> }>('/admin/events'),
  ]);

  const now = Date.now();
  const linkable = events.events
    .filter((e) => e.published && new Date(e.date).getTime() >= now)
    .map(({ id, title }) => ({ id, title }));

  return (
    <div>
      <div className="label">In the app</div>
      <h1 className="font-display text-4xl text-ink">Promotions</h1>
      <p className="mt-1 text-sm text-mute">
        The slides at the very top of the app&apos;s home screen. With no live slides, the app shows
        its standard artwork.
      </p>
      <PromotionsClient promos={promos.promos} events={linkable} />
    </div>
  );
}
