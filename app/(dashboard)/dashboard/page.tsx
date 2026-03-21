import type { Metadata } from 'next';
import { Dashboard } from '@/src/screens/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return <Dashboard />;
}
