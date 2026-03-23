import { ForgotPassword } from '@/src/screens/ForgotPassword';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Forgot Password' };

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
