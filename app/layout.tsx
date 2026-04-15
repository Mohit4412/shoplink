import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/src/index.css';
import { Providers } from './providers';
import { getCurrentSessionUser } from '@/server/auth';
import { GoogleAnalytics } from '@/src/components/analytics/GoogleAnalytics';

export const metadata: Metadata = {
  title: {
    default: 'MyShopLink',
    template: '%s | MyShopLink',
  },
  description: 'Build a WhatsApp-first storefront with a modern dashboard.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentSessionUser();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {measurementId ? <GoogleAnalytics measurementId={measurementId} /> : null}
        <Providers initialUser={user}>{children}</Providers>
      </body>
    </html>
  );
}
