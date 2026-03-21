import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/server/auth';
import { ProtectedAppShell } from '@/src/components/layout/ProtectedAppShell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect('/signup');
  }

  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
