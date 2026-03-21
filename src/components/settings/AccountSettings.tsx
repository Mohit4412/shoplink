'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { CheckCircle2, Upload, ExternalLink, ChevronDown, LogOut, CreditCard, AlertCircle, Sparkles } from 'lucide-react';
import { countryCodes } from '../../utils/countryCodes';
import { deleteImage, uploadImage } from '../../utils/upload';
import { UpgradeModal, useUpgradeModal } from '../billing/UpgradeModal';

interface AccountSettingsProps {
  onTabChange?: (tab: 'account' | 'store' | 'domain' | 'billing') => void;
}

export function AccountSettings({ onTabChange }: AccountSettingsProps) {
  const { user, updateUserProfile, logout } = useStore();
  const upgradeModal = useUpgradeModal();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [saveError, setSaveError] = useState('');
  const [waError, setWaError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [accountForm, setAccountForm] = useState({
    avatarUrl: user?.avatarUrl || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    whatsappNumber: user?.whatsappNumber || '',
  });

  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    setAccountForm({
      avatarUrl: user?.avatarUrl || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      bio: user?.bio || '',
      whatsappNumber: user?.whatsappNumber || '',
    });
  }, [user]);

  useEffect(() => {
    if (user?.whatsappNumber) {
      const sortedCodes = [...countryCodes].sort((a, b) => b.dialCode.length - a.dialCode.length);
      const match = sortedCodes.find(c => user.whatsappNumber.startsWith(c.dialCode));
      if (match) {
        setSelectedCountry(match);
        setPhoneNumber(user.whatsappNumber.slice(match.dialCode.length));
      } else {
        setPhoneNumber(user.whatsappNumber);
      }
    }
  }, [user?.whatsappNumber]);

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      setWaError('Enter a valid WhatsApp number with country code');
      return;
    }
    setWaError('');
    setSaveError('');
    setIsSaving(true);
    const fullNumber = `${selectedCountry.dialCode}${digits}`;
    try {
      const previousAvatarUrl = user?.avatarUrl || '';
      await updateUserProfile({
        avatarUrl: accountForm.avatarUrl,
        firstName: accountForm.firstName,
        lastName: accountForm.lastName,
        username: accountForm.username.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        bio: accountForm.bio,
        whatsappNumber: fullNumber,
      });
      if (previousAvatarUrl && previousAvatarUrl !== accountForm.avatarUrl) {
        void deleteImage(previousAvatarUrl);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save account settings right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file?: File) => {
    if (!file) return;
    setUploadError('');
    setIsUploadingAvatar(true);
    try {
      const previousAvatarUrl = accountForm.avatarUrl;
      const avatarUrl = await uploadImage(file, 'avatars');
      if (previousAvatarUrl && previousAvatarUrl !== avatarUrl) {
        void deleteImage(previousAvatarUrl);
      }
      setAccountForm((prev) => ({ ...prev, avatarUrl }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Unable to upload avatar right now.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const displayName = [accountForm.firstName, accountForm.lastName].filter(Boolean).join(' ') || user?.email || 'Your Name';
  const renewalDate = user?.subscriptionRenewalDate ? new Date(user.subscriptionRenewalDate) : null;
  const hasValidRenewalDate = renewalDate instanceof Date && !Number.isNaN(renewalDate.getTime());
  const isPro = user?.plan === 'Pro';
  const isExpiredPro = isPro && (!hasValidRenewalDate || renewalDate.getTime() < Date.now());
  const isActivePro = isPro && !isExpiredPro;
  const planMetaText = !isPro
    ? 'Upgrade available'
    : isExpiredPro
      ? 'Action required: Renew plan'
      : `Renews ${user?.subscriptionRenewalDate}`;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT — Profile Identity Card */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-4 lg:sticky lg:top-4">

            {/* Avatar */}
            <div className="relative group">
              <img
                src={accountForm.avatarUrl || user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=111&color=fff`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Upload className="w-5 h-5 text-white" />
              </label>
              <input
                type="file"
                accept="image/*"
                id="avatar-upload"
                className="hidden"
                onChange={(e) => void handleAvatarUpload(e.target.files?.[0])}
              />
            </div>
            {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
            {isUploadingAvatar ? <p className="text-xs text-gray-400">Uploading avatar...</p> : null}

            {/* Name & handle */}
            <div className="text-center">
              <p className="font-bold text-gray-900 text-base leading-tight">{displayName}</p>
              <p className="text-xs text-gray-400 mt-1">@{accountForm.username || user?.username}</p>
            </div>

            {/* Plan badge */}
            <div className="w-full bg-gray-900 rounded-xl px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-0.5">Current Plan</p>
              <p className="text-white font-bold text-sm">{user?.plan || 'Free'} Plan</p>
              <p className="text-gray-400 text-[10px] mt-0.5">{planMetaText}</p>
            </div>

            {isActivePro ? (
              <div className="w-full flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span className="text-xs text-green-700 font-medium">Subscription Active</span>
              </div>
            ) : null}

            {isExpiredPro ? (
              <button
                type="button"
                onClick={upgradeModal.open}
                className="w-full flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span className="text-xs font-medium text-amber-800">Action required: Renew your Pro plan</span>
              </button>
            ) : null}

            {!isPro ? (
              <button
                type="button"
                onClick={upgradeModal.open}
                className="w-full flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-left"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Upgrade to Pro to unlock premium features</span>
              </button>
            ) : null}

            {/* Quick links */}
            <div className="w-full space-y-1 pt-1 border-t border-gray-100">
              <button
                onClick={() => {
                  if (!isPro || isExpiredPro) {
                    upgradeModal.open();
                    return;
                  }
                  onTabChange?.('billing');
                }}
                className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                {!isPro ? 'Upgrade to Pro' : isExpiredPro ? 'Renew Plan' : 'Manage Billing'}
                <ExternalLink className="w-3 h-3 ml-auto text-gray-300" />
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 text-sm text-red-500 hover:text-red-700 py-2 px-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Edit Form */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleAccountSave} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
              <p className="text-xs text-gray-400 mt-0.5">Update your name, username and contact details.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                value={accountForm.firstName}
                onChange={(e) => setAccountForm({ ...accountForm, firstName: e.target.value })}
                placeholder="John"
              />
              <Input
                label="Last Name"
                value={accountForm.lastName}
                onChange={(e) => setAccountForm({ ...accountForm, lastName: e.target.value })}
                placeholder="Doe"
              />
              <Input
                label="Username"
                value={accountForm.username}
                onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                helperText="Changing your username also updates your store URL."
              />
              <Input
                label="Email Address"
                type="email"
                value={user?.email}
                disabled
                className="bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>

            <Textarea
              label="Bio"
              value={accountForm.bio}
              onChange={(e) => setAccountForm({ ...accountForm, bio: e.target.value })}
              placeholder="Tell us a bit about yourself..."
            />

            {/* WhatsApp Number */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
              <div className="flex gap-2">
                <div className="relative w-36 shrink-0">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const country = countryCodes.find(c => c.code === e.target.value);
                      if (country) setSelectedCountry(country);
                    }}
                    className="w-full h-11 rounded-lg border border-gray-300 bg-white pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.dialCode}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => { setPhoneNumber(e.target.value); setWaError(''); }}
                    placeholder="Phone number"
                    className="w-full"
                  />
                </div>
              </div>
              {waError && (
                <p className="text-xs text-red-600 mt-1">{waError}</p>
              )}
              <p className="text-xs text-gray-400">Customers reach you via this number on WhatsApp.</p>
            </div>

            {/* Save footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
              {saveStatus === 'saved' && (
                <span className="text-sm text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Changes saved
                </span>
              )}
              {saveError ? (
                <span className="text-sm text-red-600">{saveError}</span>
              ) : null}
              <div className="ml-auto">
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </div>
          </form>
        </div>

      </div>

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </div>
  );
}
