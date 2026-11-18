import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { THEME_INIT_SCRIPT } from '@/lib/theme';

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

// Pages without their own title show "Rhoddo". The host and admin areas set
// "Rhoddo Host" and "Rhoddo Admin" in their layouts.
export const metadata: Metadata = {
  title: 'Rhoddo',
  description: 'Register for marathons, runs and races, and book events across Sikkim.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
