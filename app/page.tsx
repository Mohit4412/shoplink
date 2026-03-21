import type { Metadata } from 'next';
import { LandingPage } from '@/src/screens/LandingPage';

export const metadata: Metadata = {
  title: 'Launch Your Store',
};

export default function HomePage() {
  return <LandingPage />;
}
