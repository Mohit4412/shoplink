'use client';

import { ReactNode } from 'react';
import { StoreProvider } from '@/src/context/StoreContext';
import { UserProfile } from '@/src/types';

export function Providers({ children, initialUser }: { children: ReactNode; initialUser: UserProfile | null }) {
  return <StoreProvider initialUser={initialUser}>{children}</StoreProvider>;
}
