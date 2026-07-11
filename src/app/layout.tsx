import type { Metadata, Viewport } from 'next';
import { fontSans, fontMono, fontSerif } from '@/lib/fonts';
import { AppProviders } from '@/components/providers';
import { capabilities, env } from '@/lib/env';
import { cn } from '@/lib/utils';
import './globals.css';

// Canonical site URL — locked to www.readroom.blog in production via env.appUrl.
const appUrl = env.appUrl;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'ReadRoom — Read the room before you post',
    template: '%s · ReadRoom',
  },
  description:
    'ReadRoom is AI audience simulation for people whose words carry weight. See how supporters, skeptics, customers, and everyone in between may interpret your words — before you publish them.',
  applicationName: 'ReadRoom',
  keywords: [
    'audience simulation',
    'perception intelligence',
    'content feedback',
    'AI writing',
    'pre-publishing',
  ],
  authors: [{ name: 'Gia Macool' }],
  // Orynth site verification
  other: {
    'ory-verify': 'orynth-1d64df6203e34111b118a90b03113758',
  },
  openGraph: {
    type: 'website',
    title: 'ReadRoom — Read the room before you post',
    description:
      'AI audience simulation for people whose words carry weight. Understand how your post may land before you publish.',
    url: appUrl,
    siteName: 'ReadRoom',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReadRoom — Read the room before you post',
    description: 'AI audience simulation for people whose words carry weight.',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#F8F7FC',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          fontSans.variable,
          fontMono.variable,
          fontSerif.variable,
          'min-h-dvh font-sans antialiased',
        )}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <AppProviders clerkEnabled={capabilities.clerk}>{children}</AppProviders>
      </body>
    </html>
  );
}
