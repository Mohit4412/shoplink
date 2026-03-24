'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRO_FEATURES = [
  'Unlimited products',
  'All 6 storefront themes',
  'No MyShopLink branding',
  'Full analytics dashboard',
  'Order management',
  'Custom domain support',
  'Priority support',
];

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== 'undefined') return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center text-center py-6 px-4 gap-5"
    >
      {/* Animated badge */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
      >
        <Zap className="w-9 h-9 text-white fill-white" />
      </motion.div>

      {/* Confetti dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#059669', '#fbbf24', '#3b82f6', '#f43f5e', '#a855f7'][i % 5],
              left: `${10 + (i * 7.5) % 80}%`,
              top: `${5 + (i * 13) % 40}%`,
            }}
            initial={{ opacity: 0, y: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-10, -40 - i * 4], scale: [0, 1, 0.5] }}
            transition={{ delay: 0.15 + i * 0.06, duration: 1.2, ease: 'easeOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-2"
      >
        <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: '#059669' }}>
          Welcome to Pro
        </p>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
          You're all set! 🎉
        </h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
          Your Pro plan is now active. All features are unlocked — go build something great.
        </p>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {PRO_FEATURES.map((f, i) => (
          <motion.span
            key={f}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 + i * 0.05 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#059669]"
          >
            <Check className="w-3 h-3" /> {f}
          </motion.span>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={onClose}
        className="mt-2 px-8 py-3 rounded-xl bg-gray-900 text-white text-sm font-black active:scale-95 transition-transform"
      >
        Start exploring Pro →
      </motion.button>
    </motion.div>
  );
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user, refreshUser } = useStore();
  const isPro = user?.plan === 'Pro';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setError(null);
    setLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment gateway. Please try again.');

      const res = await fetch('/api/billing/subscribe', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create subscription');

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const rzp = new window.Razorpay({
        key: keyId,
        subscription_id: data.subscriptionId,
        name: 'MyShopLink',
        description: 'Pro Plan — ₹349/month',
        image: '/favicon.ico',
        prefill: {
          name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username,
          email: user.email,
          contact: user.whatsappNumber,
        },
        theme: { color: '#059669' },
        handler: async (response: { razorpay_subscription_id?: string }) => {
          const subId = response?.razorpay_subscription_id ?? data.subscriptionId;
          try {
            const activateRes = await fetch('/api/billing/activate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscriptionId: subId }),
            });
            if (activateRes.ok) {
              await refreshUser();
              setSuccess(true);
            }
          } catch { /* ignore */ }
          setLoading(false);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={success ? '' : 'Unlock MyShopLink Pro'} className="max-w-md">
      <AnimatePresence mode="wait">
        {success ? (
          <SuccessView key="success" onClose={handleClose} />
        ) : (
          <motion.div
            key="upgrade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade to Pro
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Unlock MyShopLink Pro</h3>
                <p className="mt-1 text-sm text-gray-500">Secure checkout via Razorpay — cancel anytime.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Free</p>
                    <p className="mt-1 text-sm text-gray-500">Getting started</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                    {isPro ? 'Available' : 'Current'}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>Up to 10 products</li>
                  <li>Classic theme only</li>
                  <li>MyShopLink branding</li>
                  <li>No custom domain</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-900 bg-gray-900 p-5 text-white shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Pro</p>
                    <p className="mt-1 text-3xl font-bold">₹349<span className="text-sm font-medium text-gray-300">/mo</span></p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    {isPro ? 'Current' : 'Recommended'}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-100">
                  {PRO_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
            )}

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">Secured by Razorpay · Cancel anytime</p>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
                  Maybe later
                </Button>
                <Button type="button" onClick={handleUpgrade} disabled={isPro || loading}>
                  {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Opening checkout…</span>
                  ) : isPro ? 'You are on Pro' : 'Upgrade Now — ₹349/mo'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
