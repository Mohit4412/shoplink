import type { Metadata } from 'next';
import { LandingPage } from '@/src/screens/LandingPage';

export const metadata: Metadata = {
  title: 'MyShopLink | Your Catalogue Link for Instagram Sellers',
  description: 'Share one link. Customers browse your products and order directly on WhatsApp. Built for Indian small business sellers.',
};

export default function HomePage() {
  return <LandingPage />;
}
