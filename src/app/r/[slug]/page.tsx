import type { Metadata } from 'next';
import { EventRegistration, eventMetadata } from '@/components/register/EventRegistration';
import { loadEventBySlug } from '@/lib/publicEvent';

// rhoddo.com/r/<slug>: the registration link hosts share.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return eventMetadata(await loadEventBySlug(slug.toLowerCase()));
}

export default async function RegistrationPage({ params }: Props) {
  const { slug } = await params;
  return <EventRegistration result={await loadEventBySlug(slug.toLowerCase())} />;
}
