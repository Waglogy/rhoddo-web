import type { Metadata } from 'next';

// The admin sign-in page. It's a client page, so its title is set here.
export const metadata: Metadata = { title: 'Rhoddo Admin' };

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
