'use client';

import { useState } from 'react';
import { CheckCircle2, CreditCard, Sparkles, Zap, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UpgradeModal, useUpgradeModal } from '../billing/UpgradeModal';

const PRO_FEATURES = [
  'Unlimited products',
  'All 6 storefront themes',
  'No MyShopLink branding',
  'Full analytics dashboard',
  'Order management',
  'Custom domain support',
  'Priority support',
];

const FREE_LIMITS = [
  'Up to 10 products',
  'Classic theme only',
  'MyShopLink branding shown',
  'No custom domain',
];

function formatRenewalDate(dateStr: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function BillingSettings() {
  const { user, refreshUser } = useStore();
  const upgradeModal = useUpgradeModal();
  const isPro = user?.plan === 'Pro';
  const isTrialPro = isPro && !user?.razorpaySubscriptionId;
  const renewalDate = user?.subscriptionRenewalDate ? new Date(user.subscriptionRenewalDate) : null;
  const hasValidRenewalDate = renewalDate instanceof Date && !isNaN(renewalDate.getTime());
  const isExpiredPro = isPro && (!hasValidRenewalDate || renewalDate!.getTime() < Date.now());
  const isActivePro = isPro && !isExpiredPro;

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelState, setCancelState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cancelError, setCancelError] = useState('');

  const handleCancel = async () => {
    setCancelState('loading');
    setCancelError('');
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      if (res.ok) {
        setCancelState('success');
        refreshUser?.();
      } else {
        const data = await res.json().catch(() => ({}));
        setCancelError(data.error || 'Failed to cancel. Contact support@myshoplink.site');
        setCancelState('error');
      }
    } catch {
      setCancelError('Network error. Please try again.');
      setCancelState('error');
    }
  };

  const formattedRenewal = formatRenewalDate(user?.subscriptionRenewalDate ?? '');

  return (
    <div className="space-y-3 mt-4">

      {/* Current Plan Card */}
      <div className={`rounded-2xl border overflow-hidden ${isActivePro ? 'border-[#059669]/30 bg-[#ecfdf5]' : 'border-amber-200 bg-[#FFFBEB]'}`}>
        {/* Plan badge row */}
        <div className={`px-4 py-3 flex items-center justify-between border-b ${isActivePro ? 'border-[#059669]/20' : 'border-amber-200/60'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActivePro ? 'bg-[#059669]/10' : 'bg-amber-100'}`}>
              {isActivePro ? <Zap className="w-4 h-4 text-[#059669]" /> : <Sparkles className="w-4 h-4 text-amber-600" />}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {isActivePro ? (isTrialPro ? 'Pro Trial' : 'Pro Plan') : isExpiredPro ? 'Pro (Expired)' : 'Free Plan'}
              </p>
              <p className="text-[11px] font-medium text-gray-500">
                {isActivePro && formattedRenewal
                  ? isTrialPro
                    ? `Trial ends on ${formattedRenewal}`
                    : `Renews on ${formattedRenewal}`
                  : isActivePro
                  ? isTrialPro
                    ? '14-day trial active'
                    : 'Active'
                  : isExpiredPro
                  ? 'Your Pro access has expired'
                  : 'Limited features'}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
            isActivePro ? 'bg-[#059669] text-white' : 'bg-amber-200 text-amber-900'
          }`}>
            {isActivePro ? 'Active' : isExpiredPro ? 'Expired' : 'Free'}
          </span>
        </div>

        {/* Features list */}
        <div className="px-4 py-3 space-y-2">
          {(isActivePro ? PRO_FEATURES : FREE_LIMITS).map(f => (
            <div key={f} className="flex items-center gap-2.5">
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActivePro ? 'text-[#059669]' : 'text-gray-300'}`} />
              <span className="text-sm text-gray-700">{f}</span>
            </div>
          ))}
        </div>

        {/* CTA / Cancel area */}
        <div className="px-4 pb-4 space-y-2">
          {isActivePro ? (
            <>
              {/* Cancel success state */}
              {cancelState === 'success' && (
                <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-800">
                    {isTrialPro
                      ? `Trial access will remain active until ${formattedRenewal ?? 'your trial end date'}.`
                      : `Subscription cancelled. You'll keep Pro access until ${formattedRenewal ?? 'your renewal date'}.`}
                  </p>
                </div>
              )}

              {/* Cancel error state */}
              {cancelState === 'error' && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700">{cancelError}</p>
                </div>
              )}

              {/* Inline cancel confirmation */}
              {showCancelConfirm && cancelState !== 'success' ? (
                <div className="bg-white border border-red-200 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{isTrialPro ? 'End trial access?' : 'Cancel subscription?'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isTrialPro
                          ? `You'll keep trial access until ${formattedRenewal ?? 'your trial end date'}, then revert to Free.`
                          : `You'll keep Pro access until ${formattedRenewal ?? 'your renewal date'}, then revert to Free.`}
                      </p>
                    </div>
                    <button onClick={() => setShowCancelConfirm(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 h-9 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {isTrialPro ? 'Keep trial' : 'Keep Pro'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelState === 'loading'}
                      className="flex-1 h-9 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors"
                    >
                      {cancelState === 'loading' ? 'Cancelling…' : 'Yes, cancel'}
                    </button>
                  </div>
                </div>
              ) : cancelState !== 'success' && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full h-10 rounded-xl border border-[#059669]/40 text-[#15803d] text-sm font-semibold hover:bg-[#dcfce7] transition-colors"
                >
                  {isTrialPro ? 'End trial' : 'Cancel subscription'}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={upgradeModal.open}
              className="w-full h-10 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isExpiredPro ? 'Renew Pro' : 'Upgrade to Pro — ₹349/mo'}
            </button>
          )}
        </div>
      </div>

      {/* Payment Method — Pro only */}
      {isActivePro && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 pt-3.5 pb-2 border-b border-gray-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Payment method</p>
          </div>
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Razorpay</p>
              <p className="text-xs text-gray-400">Cards, UPI, and netbanking via Razorpay.</p>
            </div>
          </div>
        </div>
      )}

      {/* Billing support note */}
      {isActivePro && (
        <p className="text-[11px] text-gray-400 text-center px-2">
          For billing queries, reach us at{' '}
          <a href="mailto:support@myshoplink.site" className="underline hover:text-gray-700">support@myshoplink.site</a>
        </p>
      )}

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </div>
  );
}
