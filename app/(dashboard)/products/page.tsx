import type { Metadata } from 'next';
import { Products } from '@/src/screens/Products';

export const metadata: Metadata = {
  title: 'Products',
};

export default function ProductsPage() {
  return <Products />;
}
