'use client';

import { AlertTriangle, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useUpgradeModal, UpgradeModal } from './UpgradeModal';

const GRACE_DAYS = 3;

export function RenewalBanner() {
  const { user, updateUserProfile } = useStore();
  const upgradeModal = useUpgradeModal();

  if (!user || user.plan !== 'Pro') return null;
  const isTrialPro = !user.razorpaySubscriptionId;

  const renewalDate = user.subscriptionRenewalDate ? new Date(user.subscriptionRenewalDate) : null;
  if (!renewalDate || isNaN(renewalDate.getTime())) return null;

  const now = Date.now();
  const msUntilExpiry = renewalDate.getTime() - now;
  const daysUntilExpiry = msUntilExpiry / (1000 * 60 * 60 * 24);

  // Auto-downgrade after grace period
  if (daysUntilExpiry < -GRACE_DAYS) {
    void updateUserProfile({ plan: 'Free', subscriptionRenewalDate: '' });
    return null;
  }

  // Show banner within 3 days of expiry or already expired (grace period)
  if (daysUntilExpiry > 3) return null;

  const isExpired = daysUntilExpiry <= 0;
  const daysLeft = Math.max(0, Math.ceil(daysUntilExpiry));

  return (
    <>
      <div className={`mx-3 mt-3 rounded-xl px-4 py-3 flex items-center gap-3 ${
        isExpired ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
      }`}>
        <AlertTriangle className={`w-4 h-4 shrink-0 ${isExpired ? 'text-red-500' : 'text-amber-500'}`} />
        <p className={`text-xs font-semibold flex-1 ${isExpired ? 'text-red-700' : 'text-amber-700'}`}>
          {isExpired
            ? `${isTrialPro ? 'Your Pro trial' : 'Your Pro plan'} has expired. You have ${GRACE_DAYS - Math.abs(Math.floor(daysUntilExpiry))} day(s) left before downgrade.`
            : `${isTrialPro ? 'Your Pro trial' : 'Your Pro plan'} ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. ${isTrialPro ? 'Upgrade to keep Pro access.' : 'Renew to keep access.'}`}
        </p>
        <button
          onClick={upgradeModal.open}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold"
        >
          <Zap className="w-3 h-3" /> {isTrialPro ? 'Upgrade' : 'Renew'}
        </button>
      </div>
      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </>
  );
}
