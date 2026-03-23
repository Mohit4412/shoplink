'use client';

import React, { ReactNode, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AppShell } from './AppShell';
import { useStore } from '../../context/StoreContext';

function ShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, hydrated } = useStore();

  const view = searchParams?.get('view');
  
  let headerVariant: 'main' | 'back' = 'main';
  let pageTitle = '';
  let pageSubtitle = '';

  if (pathname.startsWith('/settings') && view) {
    headerVariant = 'back';
    switch(view) {
      case 'store':
        pageTitle = 'Store settings';
        pageSubtitle = 'Appearance and branding';
        break;
      case 'account':
        pageTitle = 'My account';
        pageSubtitle = 'Profile and security';
        break;
      case 'billing':
        pageTitle = 'Plans & pricing';
        pageSubtitle = `Current plan: ${user?.plan || 'Free'}`;
        break;
      case 'plugins':
        pageTitle = 'Store sections';
        pageSubtitle = 'Show and hide storefront blocks';
        break;
      case 'domain':
        pageTitle = 'Custom domain';
        pageSubtitle = 'Connect your own domain';
        break;
      default:
        headerVariant = 'main';
    }
  }

  const initials = hydrated && user?.firstName 
    ? user.firstName.charAt(0).toUpperCase() 
    : hydrated && user?.username 
      ? user.username.charAt(0).toUpperCase() 
      : 'U';

  return (
    <AppShell 
      headerVariant={headerVariant}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
      userInitials={initials}
    >
      {children}
    </AppShell>
  );
}

export function ProtectedAppShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F2F3F5]" />}>
      <ShellContent>{children}</ShellContent>
    </Suspense>
  );
}
