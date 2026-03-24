'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Store, Loader2, CheckCircle2 } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-12 px-4 font-sans text-gray-900">
      <Link href="/" className="flex items-center gap-2 mb-8 mt-4 hover:opacity-90 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-[#059669] flex items-center justify-center shadow-sm">
          <Store className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-gray-900">MyShopLink</span>
      </Link>

      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] p-8">
        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
            <p className="text-sm text-gray-500 mt-2">
              If an account exists for <span className="font-medium text-gray-700">{email}</span>, we've sent a password reset link. It expires in 60 minutes.
            </p>
            <Link href="/signup?mode=login" className="mt-6 inline-block text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Forgot your password?</h1>
              <p className="text-sm text-gray-500 mt-2">Enter your email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full h-[52px] rounded-xl bg-[#059669] text-white font-semibold text-base hover:bg-[#047857] flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-gray-100 pt-5">
              <Link href="/signup?mode=login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
