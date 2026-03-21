'use client';

import type { ReactNode } from 'react';
import { AppLayout } from './AppLayout';

export function ProtectedAppShell({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
