import type { Metadata } from 'next';
import { Analytics } from '@/src/screens/Analytics';

export const metadata: Metadata = {
  title: 'Analytics',
};

export default function AnalyticsPage() {
  return <Analytics />;
}
