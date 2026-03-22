import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/src/index.css';
import { Providers } from './providers';
import { getCurrentSessionUser } from '@/server/auth';

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

  return (
    <html lang="en">
      <body>
        <Providers initialUser={user}>{children}</Providers>
      </body>
    </html>
  );
}
