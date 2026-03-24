'use client';

import React from 'react';
import { CheckCircle2, CreditCard, Download, Receipt, Sparkles, Zap } from 'lucide-react';
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

export function BillingSettings() {
  const { user } = useStore();
  const upgradeModal = useUpgradeModal();
  const isPro = user?.plan === 'Pro';
  const renewalDate = user?.subscriptionRenewalDate ? new Date(user.subscriptionRenewalDate) : null;
  const hasValidRenewalDate = renewalDate instanceof Date && !Number.isNaN(renewalDate.getTime());
  const isExpiredPro = isPro && (!hasValidRenewalDate || renewalDate!.getTime() < Date.now());
  const isActivePro = isPro && !isExpiredPro;
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const handleDownload = (id: string) => {
    setDownloading(id);
    setTimeout(() => { setDownloading(null); alert(`Invoice ${id} download started!`); }, 1000);
  };

  const invoices = [
    { id: 'INV-001', date: '2026-03-01', amount: '₹349.00', status: 'Paid' },
    { id: 'INV-002', date: '2026-02-01', amount: '₹349.00', status: 'Paid' },
    { id: 'INV-003', date: '2026-01-01', amount: '₹349.00', status: 'Paid' },
  ];

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
                {isActivePro ? 'Pro Plan' : isExpiredPro ? 'Pro (Expired)' : 'Free Plan'}
              </p>
              <p className="text-[11px] font-medium text-gray-500">
                {isActivePro
                  ? `Renews ${user?.subscriptionRenewalDate || 'lifetime'}`
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

        {/* CTA */}
        <div className="px-4 pb-4">
          {isActivePro ? (
            <button
              onClick={() => alert('Subscription management will be connected once Razorpay is live.')}
              className="w-full h-10 rounded-xl border border-[#059669]/40 text-[#15803d] text-sm font-semibold hover:bg-[#dcfce7] transition-colors"
            >
              Manage subscription
            </button>
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
              <p className="text-xs text-gray-400">Manage cards and UPI after checkout is connected.</p>
            </div>
            <button
              onClick={() => alert('Payment method management coming soon.')}
              className="h-8 px-3 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Billing History — Pro only */}
      {isActivePro && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 pt-3.5 pb-2 border-b border-gray-50 flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Billing history</p>
            <button
              onClick={() => alert('All invoices download started!')}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Download className="w-3 h-3" /> Download all
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {invoices.map(invoice => (
              <div key={invoice.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{invoice.id}</p>
                  <p className="text-xs text-gray-400">{invoice.date}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 shrink-0">{invoice.amount}</span>
                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">
                  {invoice.status}
                </span>
                <button
                  onClick={() => handleDownload(invoice.id)}
                  disabled={downloading === invoice.id}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-40 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-gray-50">
            <p className="text-[11px] text-gray-400 text-center">
              Full billing history available after Razorpay integration. Questions?{' '}
              <a href="mailto:support@myshoplink.site" className="underline hover:text-gray-700">support@myshoplink.site</a>
            </p>
          </div>
        </div>
      )}

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </div>
  );
}
