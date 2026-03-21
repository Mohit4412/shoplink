import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/server/auth';
import { Signup } from '@/src/screens/Signup';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default async function SignupPage() {
  const user = await getCurrentSessionUser();
  if (user) {
    redirect('/dashboard');
  }

  return <Signup />;
}
