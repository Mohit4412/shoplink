'use client';

import React from 'react';
import { CheckCircle2, CreditCard, Download, Receipt, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { UpgradeModal, useUpgradeModal } from '../billing/UpgradeModal';

export function BillingSettings() {
  const { user } = useStore();
  const upgradeModal = useUpgradeModal();
  const isPro = user?.plan === 'Pro';
  const renewalDate = user?.subscriptionRenewalDate ? new Date(user.subscriptionRenewalDate) : null;
  const hasValidRenewalDate = renewalDate instanceof Date && !Number.isNaN(renewalDate.getTime());
  const isExpiredPro = isPro && (!hasValidRenewalDate || renewalDate.getTime() < Date.now());
  const isActivePro = isPro && !isExpiredPro;
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const handleDownload = (id: string) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
      alert(`Invoice ${id} download started!`);
    }, 1000);
  };

  const invoices = [
    { id: 'INV-001', date: '2026-03-01', amount: '₹299.00', status: 'Paid' },
    { id: 'INV-002', date: '2026-02-01', amount: '₹299.00', status: 'Paid' },
    { id: 'INV-003', date: '2026-01-01', amount: '₹299.00', status: 'Paid' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                Current Plan
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  isPro ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {user?.plan || 'Free'} Plan
                </span>
              </h3>

              {isPro ? (
                <>
                  {isActivePro ? (
                    <p className="mt-1 text-sm text-gray-500">
                      Your next renewal date is <span className="font-medium text-gray-900">{user?.subscriptionRenewalDate}</span>
                    </p>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-white p-2 text-amber-600 shadow-sm">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-amber-900">Pro renewal required</p>
                          <p className="mt-1 text-sm text-amber-800">Your Pro access needs renewal to keep premium features active.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      'Unlimited products',
                      'All storefront themes',
                      'No ShopLink branding',
                      'Priority support',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center text-sm text-gray-600">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-white p-2 text-amber-600 shadow-sm">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Free plan active</p>
                      <p className="mt-1 text-sm text-amber-800">Upgrade to Pro for unlimited products, all themes, no ShopLink branding, and custom domains.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {isPro ? (
                <>
                  <Button
                    variant={isExpiredPro ? 'primary' : 'outline'}
                    className="w-full md:w-auto"
                    onClick={() => {
                      if (isExpiredPro) {
                        upgradeModal.open();
                        return;
                      }
                      alert('Subscription management will be connected once Razorpay is live.');
                    }}
                  >
                    {isExpiredPro ? 'Renew Pro' : 'Manage Subscription'}
                  </Button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                    onClick={() => alert('Renewal settings will be available after Razorpay integration.')}
                  >
                    {isExpiredPro ? 'Renewal help' : 'Renewal Options'}
                  </button>
                </>
              ) : (
                <Button className="w-full md:w-auto" onClick={upgradeModal.open}>
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isActivePro ? (
        <>
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-medium text-gray-900">Payment Method</h3>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-12 items-center justify-center rounded border border-gray-200 bg-white">
                    <CreditCard className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Razorpay payment method placeholder</p>
                    <p className="text-xs text-gray-500">Manage cards and UPI after checkout is connected.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Billing History</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    alert('All invoices are being prepared for download...');
                    setTimeout(() => alert('Download started!'), 1000);
                  }}
                >
                  <Download className="mr-1 h-3 w-3" /> Download All
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="pb-3 font-medium">Invoice</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="group transition-colors hover:bg-gray-50/50">
                        <td className="flex items-center gap-2 py-4 font-medium text-gray-900">
                          <Receipt className="h-4 w-4 text-gray-400" />
                          {invoice.id}
                        </td>
                        <td className="py-4 text-gray-600">{invoice.date}</td>
                        <td className="py-4 font-medium text-gray-900">{invoice.amount}</td>
                        <td className="py-4">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDownload(invoice.id)}
                            disabled={downloading === invoice.id}
                            className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            {downloading === invoice.id ? 'Downloading...' : 'Download'}
                            <Download className="ml-1 h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-6">
                <p className="text-center text-xs text-gray-500">
                  Razorpay billing history will appear here once checkout is connected. For questions, contact <a href="mailto:support@example.com" className="text-blue-600 hover:underline">support@example.com</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </div>
  );
}
