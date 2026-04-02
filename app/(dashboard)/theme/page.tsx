import type { Metadata } from 'next';
import { ThemePage } from '@/src/screens/ThemePage';

export const metadata: Metadata = {
  title: 'Theme',
};

export default function ThemeRoute() {
  return <ThemePage />;
}
