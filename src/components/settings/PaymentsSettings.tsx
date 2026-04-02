'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

type ProviderView = 'list' | 'stripe' | 'razorpay' | 'manual';

const panelClass =
  'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]';
const panelHeadClass =
  'flex items-center gap-2 border-b border-slate-200 bg-slate-50/95 px-4 py-2.5 sm:px-5';
const panelHeadLabelClass =
  'text-[11px] font-semibold uppercase tracking-wider text-slate-600';
const panelBodyClass = 'space-y-5 p-4 sm:p-5';

interface ProviderCardProps {
  title: string;
  subtitle: string;
  badge: string;
  badgeTone: 'live' | 'coming' | 'manual';
  icon: typeof CreditCard;
  onClick: () => void;
}

function ProviderCard({ title, subtitle, badge, badgeTone, icon: Icon, onClick }: ProviderCardProps) {
  const badgeClass =
    badgeTone === 'live'
      ? 'bg-emerald-100 text-emerald-700'
      : badgeTone === 'manual'
        ? 'bg-sky-100 text-sky-700'
        : 'bg-amber-100 text-amber-800';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}>{badge}</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
    </button>
  );
}

function ProviderBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to payment methods
    </button>
  );
}

export function PaymentsSettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { store, updateStoreSettings } = useStore();
  const syncedReturnRef = useRef(false);

  const [view, setView] = useState<ProviderView>('list');
  const [form, setForm] = useState({
    upiId: store.paymentSettings?.upiId ?? '',
    bankAccountName: store.paymentSettings?.bankAccountName ?? '',
    bankAccountNumber: store.paymentSettings?.bankAccountNumber ?? '',
    bankIfsc: store.paymentSettings?.bankIfsc ?? '',
    bankBranch: store.paymentSettings?.bankBranch ?? '',
    enableOnlineCheckout: Boolean(store.paymentSettings?.enableOnlineCheckout),
  });
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const stripeAccount = store.paymentSettings?.stripe;
  const stripeReady = Boolean(
    stripeAccount?.accountId &&
      stripeAccount.onboardingComplete &&
      stripeAccount.chargesEnabled,
  );
  const stripeStatusLabel = stripeReady ? 'Ready' : stripeAccount?.accountId ? 'Setup required' : 'Not connected';

  useEffect(() => {
    setForm({
      upiId: store.paymentSettings?.upiId ?? '',
      bankAccountName: store.paymentSettings?.bankAccountName ?? '',
      bankAccountNumber: store.paymentSettings?.bankAccountNumber ?? '',
      bankIfsc: store.paymentSettings?.bankIfsc ?? '',
      bankBranch: store.paymentSettings?.bankBranch ?? '',
      enableOnlineCheckout: Boolean(store.paymentSettings?.enableOnlineCheckout),
    });
  }, [store.paymentSettings]);

  useEffect(() => {
    const providerParam = searchParams?.get('provider');
    if (providerParam === 'stripe' || providerParam === 'razorpay' || providerParam === 'manual') {
      setView(providerParam);
    }
  }, [searchParams]);

  const paymentSummary = useMemo(() => {
    const configured = [];
    if (store.paymentSettings?.upiId) configured.push('UPI');
    if (store.paymentSettings?.bankAccountNumber) configured.push('Bank transfer');
    return configured.length > 0 ? configured.join(' · ') : 'COD and WhatsApp are always available';
  }, [store.paymentSettings]);

  useEffect(() => {
    if (searchParams?.get('view') !== 'payments' || searchParams.get('stripe') !== 'return' || syncedReturnRef.current) {
      return;
    }
    syncedReturnRef.current = true;
    setView('stripe');
    void handleStripeSync(true);
  }, [searchParams]);

  const replacePaymentsRoute = (nextView: ProviderView) => {
    if (nextView === 'list') {
      router.replace('/settings?view=payments', { scroll: false });
      return;
    }
    router.replace(`/settings?view=payments&provider=${nextView}`, { scroll: false });
  };

  const handleStripeSync = async (fromReturn = false) => {
    setIsSyncing(true);
    setSaveError('');
    setSyncMessage('');
    try {
      const response = await fetch('/api/payments/stripe/status', { method: 'POST' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to refresh Stripe status.');
      }

      await updateStoreSettings({ paymentSettings: payload.paymentSettings });
      setSyncMessage(fromReturn ? 'Stripe account connected.' : 'Stripe status refreshed.');
      if (fromReturn) {
        replacePaymentsRoute('stripe');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to refresh Stripe status.';
      setSaveError(message);
      if (fromReturn) {
        router.replace(`/settings?view=payments&provider=stripe&stripe=error&message=${encodeURIComponent(message)}`, { scroll: false });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStripeConnect = () => {
    setSaveError('');
    setSyncMessage('');
    window.location.assign('/api/payments/stripe/connect');
  };

  const handleStripeSave = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSyncMessage('');

    try {
      await updateStoreSettings({
        paymentSettings: {
          ...(store.paymentSettings ?? {}),
          enableOnlineCheckout: stripeReady ? form.enableOnlineCheckout : false,
          checkoutProvider: stripeReady && form.enableOnlineCheckout ? 'stripe' : 'manual',
        },
      });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save Stripe settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSyncMessage('');

    try {
      await updateStoreSettings({
        paymentSettings: {
          ...(store.paymentSettings ?? {}),
          upiId: form.upiId.trim() || undefined,
          bankAccountName: form.bankAccountName.trim() || undefined,
          bankAccountNumber: form.bankAccountNumber.trim() || undefined,
          bankIfsc: form.bankIfsc.trim().toUpperCase() || undefined,
          bankBranch: form.bankBranch.trim() || undefined,
          enableOnlineCheckout: Boolean(store.paymentSettings?.enableOnlineCheckout && stripeReady),
          checkoutProvider:
            store.paymentSettings?.enableOnlineCheckout && stripeReady ? 'stripe' : 'manual',
        },
      });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save manual payment settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (view === 'stripe') {
    return (
      <div className="space-y-4">
        <ProviderBackButton onClick={() => { setView('list'); replacePaymentsRoute('list'); }} />

        <form onSubmit={handleStripeSave} className="space-y-4">
          <div className={panelClass}>
            <div className={panelHeadClass}>
              <CreditCard className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span className={panelHeadLabelClass}>Stripe checkout</span>
            </div>
            <div className={panelBodyClass}>
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">Stripe Standard</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${stripeReady ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                      {stripeStatusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Let customers pay online on your store checkout page. Sellers connect their own Stripe account and receive funds there directly.
                  </p>
                  {stripeAccount?.accountId ? (
                    <div className="space-y-1 text-xs text-slate-500">
                      <p>Account: <span className="font-medium text-slate-700">{stripeAccount.accountId}</span></p>
                      {stripeAccount.accountEmail ? <p>Email: {stripeAccount.accountEmail}</p> : null}
                      <p>
                        Charges {stripeAccount.chargesEnabled ? 'enabled' : 'disabled'} · Payouts {stripeAccount.payoutsEnabled ? 'enabled' : 'disabled'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-slate-500">
                      Connect your Stripe account first. Stripe will ask the seller to sign in and approve ShopLink access.
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <Button type="button" onClick={handleStripeConnect}>
                    {stripeAccount?.accountId ? 'Reconnect Stripe' : 'Connect Stripe'}
                  </Button>
                  {stripeAccount?.accountId ? (
                    <button
                      type="button"
                      onClick={() => void handleStripeSync(false)}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800 disabled:opacity-60"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      Refresh status
                    </button>
                  ) : null}
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  checked={form.enableOnlineCheckout}
                  disabled={!stripeReady}
                  onChange={(event) => setForm((prev) => ({ ...prev, enableOnlineCheckout: event.target.checked }))}
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">Show “Pay online” at checkout</p>
                  <p className="text-xs font-medium text-slate-500">
                    {stripeReady
                      ? 'Adds a secure online checkout option alongside your current manual payment methods.'
                      : 'Finish connecting the Stripe account first, then come back here to enable checkout.'}
                  </p>
                </div>
              </label>

              {!stripeReady ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">
                  Stripe is not ready yet, so “Pay online” cannot be enabled. Use the connect button above to continue onboarding.
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-h-[1.25rem] text-sm">
              {saveState === 'saved' ? (
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                  Stripe settings saved
                </span>
              ) : null}
              {syncMessage ? (
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
                  {syncMessage}
                </span>
              ) : null}
              {searchParams?.get('stripe') === 'error' && searchParams.get('message') ? (
                <span className="text-xs font-medium text-red-600">{searchParams.get('message')}</span>
              ) : null}
              {saveError ? <span className="text-xs font-medium text-red-600">{saveError}</span> : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {stripeAccount?.accountId ? (
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Open Stripe
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                </a>
              ) : null}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save Stripe settings'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'manual') {
    return (
      <div className="space-y-4">
        <ProviderBackButton onClick={() => { setView('list'); replacePaymentsRoute('list'); }} />

        <form onSubmit={handleManualSave} className="space-y-4">
          <div className={panelClass}>
            <div className={panelHeadClass}>
              <Banknote className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span className={panelHeadLabelClass}>Manual payment methods</span>
            </div>
            <div className={panelBodyClass}>
              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                Keep your current manual flow as-is. Customers can still order through WhatsApp, COD, UPI, or bank transfer.
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Input
                  label="UPI ID"
                  value={form.upiId}
                  onChange={(event) => setForm((prev) => ({ ...prev, upiId: event.target.value }))}
                  placeholder="yourstore@upi"
                />
                <Input
                  label="Bank account name"
                  value={form.bankAccountName}
                  onChange={(event) => setForm((prev) => ({ ...prev, bankAccountName: event.target.value }))}
                  placeholder="MyShopLink Store LLP"
                />
                <Input
                  label="Bank account number"
                  value={form.bankAccountNumber}
                  onChange={(event) => setForm((prev) => ({ ...prev, bankAccountNumber: event.target.value }))}
                  placeholder="123456789012"
                />
                <Input
                  label="IFSC code"
                  value={form.bankIfsc}
                  onChange={(event) => setForm((prev) => ({ ...prev, bankIfsc: event.target.value.toUpperCase() }))}
                  placeholder="HDFC0001234"
                />
              </div>
              <Input
                label="Bank branch"
                value={form.bankBranch}
                onChange={(event) => setForm((prev) => ({ ...prev, bankBranch: event.target.value }))}
                placeholder="Bandra West"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-h-[1.25rem] text-sm">
              {saveState === 'saved' ? (
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                  Manual payment settings saved
                </span>
              ) : null}
              {saveError ? <span className="text-xs font-medium text-red-600">{saveError}</span> : null}
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save manual methods'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'razorpay') {
    return (
      <div className="space-y-4">
        <ProviderBackButton onClick={() => { setView('list'); replacePaymentsRoute('list'); }} />
        <div className={panelClass}>
          <div className={panelHeadClass}>
            <WalletCards className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <span className={panelHeadLabelClass}>Razorpay</span>
          </div>
          <div className={panelBodyClass}>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Razorpay seller payouts are planned next. We’ve kept the payment architecture provider-friendly, so this can be added without removing your current manual flow.
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>What this will support later:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Seller account connection for Indian merchants</li>
                <li>Checkout directly on the store page</li>
                <li>Provider-level order tracking alongside Stripe</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={panelClass}>
        <div className={panelHeadClass}>
          <WalletCards className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          <span className={panelHeadLabelClass}>Payment setup</span>
        </div>
        <div className={panelBodyClass}>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Choose how this store accepts payments</h3>
            <p className="mt-1 text-sm text-slate-500">
              Start with one setup option. You can keep manual payments active even after adding online checkout later.
            </p>
          </div>

          <div className="space-y-3">
            <ProviderCard
              title="Stripe"
              subtitle="Accept card and online payments directly on your store checkout page."
              
              badge={stripeStatusLabel}
              badgeTone={stripeReady ? 'live' : 'coming'}
              icon={CreditCard}
              onClick={() => {
                setView('stripe');
                replacePaymentsRoute('stripe');
              }}
            />
            <ProviderCard
              title="Manual methods"
              subtitle={paymentSummary}
              badge="Active"
              badgeTone="manual"
              icon={Banknote}
              onClick={() => {
                setView('manual');
                replacePaymentsRoute('manual');
              }}
            />
            <ProviderCard
              title="Razorpay"
              subtitle="Planned next for Indian merchant-connected checkout."
              badge="Coming soon"
              badgeTone="coming"
              icon={WalletCards}
              onClick={() => {
                setView('razorpay');
                replacePaymentsRoute('razorpay');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
