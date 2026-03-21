'use client';

import React, { useState } from 'react';
import { addMonths, format } from 'date-fns';
import { Check, Sparkles } from 'lucide-react';
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
  'All themes',
  'No ShopLink branding',
  'Custom domain',
  'Priority support',
];

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user, updateUserProfile } = useStore();
  const isPro = user?.plan === 'Pro';

  const handleUpgrade = () => {
    if (!user) return;
    void updateUserProfile({
      plan: 'Pro',
      subscriptionRenewalDate: format(addMonths(new Date(), 1), 'MMMM d, yyyy'),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unlock ShopLink Pro" className="max-w-3xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <Sparkles className="h-3.5 w-3.5" />
            Monetization ready
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Unlock ShopLink Pro</h3>
            <p className="mt-1 text-sm text-gray-500">Remove limits now. Razorpay checkout can replace this action later.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Free</p>
                <p className="mt-1 text-sm text-gray-500">Best for getting started</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                {isPro ? 'Available' : 'Current'}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Up to 5 products</li>
              <li>Classic theme only</li>
              <li>ShopLink branding</li>
              <li>No custom domain</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-900 bg-gray-900 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Pro</p>
                <p className="mt-1 text-3xl font-bold">₹299<span className="text-sm font-medium text-gray-300">/mo</span></p>
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

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">Razorpay secure checkout - cancel anytime</p>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Maybe later
            </Button>
            <Button type="button" onClick={handleUpgrade} disabled={isPro}>
              {isPro ? 'You are on Pro' : 'Upgrade Now'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
