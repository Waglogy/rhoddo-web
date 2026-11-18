import type { Metadata } from 'next';
import { EventRegistration, eventMetadata } from '@/components/register/EventRegistration';
import { loadEventById } from '@/lib/publicEvent';

// rhoddo.com/event/<id>: the older share link, shared from the app and by events
// without a short link name. Shows the same page as /r/<slug>.
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return eventMetadata(await loadEventById(id));
}

export default async function SharedEventPage({ params }: Props) {
  const { id } = await params;
  return <EventRegistration result={await loadEventById(id)} />;
}
