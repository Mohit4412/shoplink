'use client';

import { useState, FormEvent } from 'react';
import { CheckCircle2, Upload, Building2, Link2, FileText, CreditCard } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { deleteImage, uploadImage } from '../../utils/upload';
import { UpgradeModal, useUpgradeModal } from '../billing/UpgradeModal';

const panelClass =
  'overflow-hidden rounded-xl border border-zinc-200 bg-white';
const panelHeadClass =
  'flex items-center gap-2 border-b border-zinc-200 bg-zinc-50/60 px-5 py-3.5';
const panelHeadLabelClass =
  'text-xs font-semibold uppercase tracking-widest text-zinc-500';
const panelBodyClass = 'space-y-5 p-5';
const fieldLabelClass = 'mb-1 block text-sm font-medium text-zinc-700';
const controlClass =
  'border-zinc-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 focus:ring-offset-0';
const readOnlyFieldClass =
  'border-zinc-200 bg-zinc-50 text-zinc-500 cursor-not-allowed';

export function StoreSettings() {
  const { store, user, updateStoreSettings } = useStore();
  const upgradeModal = useUpgradeModal();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [storeForm, setStoreForm] = useState({
    logoUrl: store.logoUrl || '',
    name: store.name || '',
    tagline: store.tagline || '',
    bio: store.bio || '',
    currency: store.currency || 'INR',
  });

  const [paymentForm, setPaymentForm] = useState({
    upiId: store.paymentSettings?.upiId || '',
    bankAccountName: store.paymentSettings?.bankAccountName || '',
    bankAccountNumber: store.paymentSettings?.bankAccountNumber || '',
    bankIfsc: store.paymentSettings?.bankIfsc || '',
    bankBranch: store.paymentSettings?.bankBranch || '',
  });

  const sanitizeName = (val: string) => val.trim().replace(/[<>"&]/g, '');

  const handleStoreSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setIsSaving(true);
    try {
      const previousLogoUrl = store.logoUrl || '';
      await updateStoreSettings({
        ...storeForm,
        name: sanitizeName(storeForm.name),
        tagline: storeForm.tagline.trim(),
        bio: storeForm.bio.trim(),
        paymentSettings: {
          upiId: paymentForm.upiId.trim() || undefined,
          bankAccountName: paymentForm.bankAccountName.trim() || undefined,
          bankAccountNumber: paymentForm.bankAccountNumber.trim() || undefined,
          bankIfsc: paymentForm.bankIfsc.trim().toUpperCase() || undefined,
          bankBranch: paymentForm.bankBranch.trim() || undefined,
        },
      });
      if (previousLogoUrl && previousLogoUrl !== storeForm.logoUrl) {
        void deleteImage(previousLogoUrl);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save store settings right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (file?: File) => {
    if (!file) return;
    setUploadError('');
    setIsUploadingLogo(true);
    try {
      const previousLogoUrl = storeForm.logoUrl;
      const logoUrl = await uploadImage(file, 'logos');
      if (previousLogoUrl && previousLogoUrl !== logoUrl) {
        void deleteImage(previousLogoUrl);
      }
      setStoreForm(prev => ({ ...prev, logoUrl }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Unable to upload logo right now.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <form onSubmit={handleStoreSave} className="space-y-4">
      {/* Brand */}
      <div className={panelClass}>
        <div className={panelHeadClass}>
          <Building2 className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
          <span className={panelHeadLabelClass}>Brand &amp; identity</span>
        </div>
        <div className={panelBodyClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative shrink-0 group">
              {storeForm.logoUrl || store.logoUrl ? (
                <img
                  src={storeForm.logoUrl || store.logoUrl}
                  alt="Store logo"
                  className="h-20 w-20 rounded-xl border border-zinc-200 bg-white object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 select-none items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-2xl font-bold text-zinc-400">
                  {(storeForm.name || store.name || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <label
                htmlFor="logo-upload"
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-xl bg-zinc-900/45 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Upload className="h-4 w-4 text-white" aria-hidden />
                <span className="sr-only">Upload logo</span>
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900">Store logo</p>
              <p className="mt-0.5 text-xs font-medium text-zinc-500">
                Square image, at least 512×512px — JPG or PNG.
              </p>
              <input
                type="file"
                accept="image/*"
                id="logo-upload"
                className="hidden"
                onChange={e => void handleLogoUpload(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={isUploadingLogo}
                className="mt-3 h-9 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                {isUploadingLogo ? 'Uploading…' : 'Upload logo'}
              </button>
              {uploadError ? <p className="mt-2 text-xs font-medium text-red-600">{uploadError}</p> : null}
            </div>
          </div>
        </div>
      </div>

      {/* Store profile */}
      <div className={panelClass}>
        <div className={panelHeadClass}>
          <Link2 className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
          <span className={panelHeadLabelClass}>Store profile</span>
        </div>
        <div className={panelBodyClass}>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Input
              label="Store name"
              value={storeForm.name}
              onChange={e => setStoreForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Modern Boutique"
              className={controlClass}
            />
            <Input
              label="Store URL"
              value={user?.username || ''}
              readOnly
              disabled
              className={readOnlyFieldClass}
              helperText={`Live at: https://${user?.username}.myshoplink.site`}
            />
          </div>
          <div>
            <label className={fieldLabelClass} htmlFor="store-currency">
              Default currency
            </label>
            <select
              id="store-currency"
              className="h-10 w-full max-w-md rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
              value={storeForm.currency}
              onChange={e => setStoreForm(p => ({ ...p, currency: e.target.value }))}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="AUD">AUD ($)</option>
              <option value="CAD">CAD ($)</option>
            </select>
            <p className="mt-1.5 text-xs text-zinc-400">Used for prices and order totals.</p>
          </div>
        </div>
      </div>

      {/* Messaging */}
      <div className={panelClass}>
        <div className={panelHeadClass}>
          <FileText className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
          <span className={panelHeadLabelClass}>Story &amp; messaging</span>
        </div>
        <div className={panelBodyClass}>
          <Textarea
            label="Store tagline"
            value={storeForm.tagline}
            onChange={e => setStoreForm(p => ({ ...p, tagline: e.target.value }))}
            placeholder="A short line about what you sell"
            className={controlClass}
          />
          <Textarea
            label="Store bio"
            value={storeForm.bio}
            onChange={e => setStoreForm(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell customers about your story and what you offer."
            className={`min-h-[120px] ${controlClass}`}
          />
        </div>
      </div>

      {/* Payment details */}
      <div className={panelClass}>
        <div className={panelHeadClass}>
          <CreditCard className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
          <span className={panelHeadLabelClass}>Payment details</span>
        </div>
        <div className={panelBodyClass}>
          <p className="text-xs text-zinc-400">
            Shown to customers when they choose UPI or bank transfer at checkout.
          </p>
          <Input
            label="UPI ID"
            value={paymentForm.upiId}
            onChange={e => setPaymentForm(p => ({ ...p, upiId: e.target.value }))}
            placeholder="yourname@upi"
            className={controlClass}
            helperText="e.g. merchant@okaxis, 9876543210@paytm"
          />
          <div className="border-t border-zinc-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">Bank transfer</p>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Account holder name"
                value={paymentForm.bankAccountName}
                onChange={e => setPaymentForm(p => ({ ...p, bankAccountName: e.target.value }))}
                placeholder="Riya Sharma"
                className={controlClass}
              />
              <Input
                label="Account number"
                value={paymentForm.bankAccountNumber}
                onChange={e => setPaymentForm(p => ({ ...p, bankAccountNumber: e.target.value }))}
                placeholder="1234567890"
                className={controlClass}
              />
              <Input
                label="IFSC code"
                value={paymentForm.bankIfsc}
                onChange={e => setPaymentForm(p => ({ ...p, bankIfsc: e.target.value.toUpperCase() }))}
                placeholder="SBIN0001234"
                className={controlClass}
              />
              <Input
                label="Branch (optional)"
                value={paymentForm.bankBranch}
                onChange={e => setPaymentForm(p => ({ ...p, bankBranch: e.target.value }))}
                placeholder="Mumbai Main Branch"
                className={controlClass}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-3">
        <div className="min-h-[1.25rem] text-sm">
          {saveStatus === 'saved' ? (
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              Changes saved
            </span>
          ) : null}
          {saveError ? <span className="text-xs font-medium text-red-600">{saveError}</span> : null}
        </div>
        <Button type="submit" disabled={isSaving} className="shrink-0 sm:min-w-[8.5rem]">
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </form>
  );
}
