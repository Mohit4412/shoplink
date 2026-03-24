'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Store, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-600">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-gray-600 hover:text-gray-900">
          Request a new link
        </Link>
      </div>
    );
  }

  return done ? (
    <div className="text-center py-4">
      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
      <h1 className="text-xl font-bold text-gray-900">Password updated</h1>
      <p className="text-sm text-gray-500 mt-2">You can now log in with your new password.</p>
      <Link href="/signup?mode=login" className="mt-6 inline-block h-11 px-6 rounded-xl bg-gray-900 text-white text-sm font-semibold flex items-center justify-center hover:bg-gray-800 transition-colors">
        Go to login
      </Link>
    </div>
  ) : (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Set a new password</h1>
        <p className="text-sm text-gray-500 mt-2">Choose a strong password — at least 6 characters.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">New password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full h-11 pl-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

        <button
          type="submit"
          disabled={isLoading || !password}
          className="w-full h-[52px] rounded-xl bg-[#059669] text-white font-semibold text-base hover:bg-[#047857] flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {isLoading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </>
  );
}

export function ResetPassword() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-12 px-4 font-sans text-gray-900">
      <Link href="/" className="flex items-center gap-2 mb-8 mt-4 hover:opacity-90 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-[#059669] flex items-center justify-center shadow-sm">
          <Store className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-gray-900">MyShopLink</span>
      </Link>

      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] p-8">
        <Suspense fallback={<div className="h-40 flex items-center justify-center text-sm text-gray-400">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
