import { api, fetchCategoryOptions } from '@/lib/api';
import { NotificationsClient } from './NotificationsClient';

type EventLite = { id: string; title: string; district: string; category: string };
type HistoryRow = {
  title: string;
  body: string;
  eventId: string | null;
  sentAt: string;
  recipients: number;
};

export default async function AdminNotificationsPage() {
  // Pull event list + recent history in parallel so the form can pre-populate
  // the event dropdown and the history panel shows something immediately.
  const [eventsData, historyData, categories] = await Promise.all([
    api<{ events: EventLite[] }>('/admin/events'),
    api<{ history: HistoryRow[] }>('/admin/notifications/history'),
    fetchCategoryOptions(),
  ]);

  return (
    <div>
      <div className="label">Engagement</div>
      <h1 className="font-display text-4xl text-ink">Notifications</h1>
      <p className="mt-1 text-sm text-mute">
        Compose a push to any audience — all users, a specific event&apos;s attendees,
        a district, or by category interest. Recipients also see this in their in-app inbox.
      </p>

      <div className="mt-10">
        <NotificationsClient categories={categories} events={eventsData.events} initialHistory={historyData.history} />
      </div>
    </div>
  );
}
