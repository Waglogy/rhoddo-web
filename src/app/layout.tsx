import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const display = localFont({
  src: '../fonts/Fraunces-latin.woff2',
  variable: '--font-display',
  weight: '400 700',
  display: 'swap',
});

const sans = localFont({
  src: '../fonts/Inter-latin.woff2',
  variable: '--font-sans',
  weight: '400 700',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rhoddo Admin',
  description: 'Manage Rhoddo events, venues, bookings.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
