'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Upload, Check, Palette } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { deleteImage, uploadImage } from '../../utils/upload';
import { UpgradeModal, useUpgradeModal } from '../billing/UpgradeModal';

interface StoreTheme {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  preview: { bg: string; card: string; accent: string; text: string; button: string };
}

const THEMES: StoreTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean white with black accents. Timeless and professional.',
    imageUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=400&q=80',
    preview: { bg: '#FAFAFA', card: '#FFFFFF', accent: '#111111', text: '#374151', button: '#111111' },
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Dark charcoal tones for a sophisticated boutique feel.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    preview: { bg: '#0f1117', card: '#1a1d27', accent: '#6366f1', text: '#e2e8f0', button: '#6366f1' },
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Warm blush tones perfect for beauty and lifestyle brands.',
    imageUrl: 'https://images.unsplash.com/photo-1515595967223-f9fa59af5a3b?auto=format&fit=crop&w=400&q=80',
    preview: { bg: '#fff5f5', card: '#FFFFFF', accent: '#e11d48', text: '#4b2d33', button: '#e11d48' },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Nature-inspired greens for organic and wellness brands.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80',
    preview: { bg: '#f0fdf4', card: '#FFFFFF', accent: '#16a34a', text: '#15573a', button: '#16a34a' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool teal and blue vibes for a fresh, modern look.',
    imageUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=400&q=80',
    preview: { bg: '#f0f9ff', card: '#FFFFFF', accent: '#0891b2', text: '#155e75', button: '#0891b2' },
  },
  {
    id: 'amber',
    name: 'Amber',
    description: 'Warm golden tones ideal for artisan and craft stores.',
    imageUrl: 'https://images.unsplash.com/photo-1603539947678-cd3954ed515d?auto=format&fit=crop&w=400&q=80',
    preview: { bg: '#fffbeb', card: '#FFFFFF', accent: '#d97706', text: '#78350f', button: '#d97706' },
  },
  {
    id: 'vibe',
    name: 'Vibe Premium',
    description: 'Boutique luxury aesthetic. Deep teal and subtle gold on minimalist off-white.',
    imageUrl: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=400&q=80',
    preview: { bg: '#FCFBF8', card: '#FFFFFF', accent: '#0A7C6B', text: '#181C1A', button: '#0A7C6B' },
  },
];

export function StoreSettings() {
  const { store, user, updateStoreSettings } = useStore();
  const upgradeModal = useUpgradeModal();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [selectedTheme, setSelectedTheme] = useState(user?.plan === 'Free' ? 'classic' : store.theme || 'classic');
  const [themeUpgradeMessage, setThemeUpgradeMessage] = useState('');
  const [lockedThemeId, setLockedThemeId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [storeForm, setStoreForm] = useState({
    logoUrl: store.logoUrl || '',
    name: store.name || '',
    tagline: store.tagline || '',
    bio: store.bio || '',
    currency: store.currency || 'USD',
  });

  const sanitizeName = (val: string) => val.trim().replace(/[<>"&]/g, '');

  useEffect(() => {
    if (user?.plan === 'Pro') {
      setThemeUpgradeMessage('');
      setLockedThemeId(null);
      return;
    }
    setSelectedTheme('classic');
    setLockedThemeId(null);
    setSaveStatus('idle');
  }, [user?.plan]);

  const handleStoreSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    if (user?.plan === 'Free' && (selectedTheme !== 'classic' || lockedThemeId)) {
      setSaveStatus('idle');
      setThemeUpgradeMessage('Upgrade to Pro to save a premium theme. Free stores can only use the Classic theme.');
      upgradeModal.open();
      return;
    }
    setIsSaving(true);
    try {
      const previousLogoUrl = store.logoUrl || '';
      await updateStoreSettings({
        ...storeForm,
        name: sanitizeName(storeForm.name),
        tagline: storeForm.tagline.trim(),
        bio: storeForm.bio.trim(),
        theme: user?.plan === 'Free' ? 'classic' : selectedTheme,
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
      setStoreForm((prev) => ({ ...prev, logoUrl }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Unable to upload logo right now.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <form onSubmit={handleStoreSave}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT — Store Identity */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-semibold text-gray-900">Store Identity</h2>
            <p className="text-xs text-gray-400 mt-0.5">Configure your store name, logo, and currency.</p>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <img
                src={storeForm.logoUrl || store.logoUrl}
                alt="Store Logo"
                className="h-20 w-20 rounded-xl border border-gray-200 object-cover"
              />
              <label
                htmlFor="logo-upload"
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Upload className="h-5 w-5 text-white" />
              </label>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Store Logo</h3>
              <p className="mt-0.5 text-xs text-gray-400">Recommended 512×512px JPG/PNG.</p>
              <input
                type="file"
                accept="image/*"
                id="logo-upload"
                className="hidden"
                onChange={(e) => void handleLogoUpload(e.target.files?.[0])}
              />
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => document.getElementById('logo-upload')?.click()} disabled={isUploadingLogo}>
                {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
              </Button>
              {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
            </div>
          </div>

          <Input
            label="Store Name"
            value={storeForm.name}
            onChange={(e) => setStoreForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Modern Boutique"
          />

          <Input
            label="Store URL"
            value={user?.username || ''}
            readOnly
            disabled
            className="bg-gray-50 text-gray-400 cursor-not-allowed"
            helperText={`Live at: ${typeof window !== 'undefined' ? window.location.origin : ''}/${user?.username}`}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
            <select
              className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-"
              value={storeForm.currency}
              onChange={(e) => setStoreForm(p => ({ ...p, currency: e.target.value }))}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>

          <Textarea
            label="Store Tagline"
            value={storeForm.tagline}
            onChange={(e) => setStoreForm(p => ({ ...p, tagline: e.target.value }))}
            placeholder="A short description of what you sell"
          />

          <Textarea
            label="Store Bio"
            value={storeForm.bio}
            onChange={(e) => setStoreForm(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell customers about your story, what you sell, and why they should trust you."
          />
        </div>

        {/* RIGHT — Theme Picker */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-900">Storefront Theme</h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Choose a visual style for your public store page.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              const isLocked = user?.plan === 'Free' && theme.id !== 'classic';
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      setSaveStatus('idle');
                      setSaveError('');
                      setSelectedTheme(theme.id);
                      setLockedThemeId(theme.id);
                      setThemeUpgradeMessage('Upgrade to Pro to unlock all themes.');
                      return;
                    }
                    setLockedThemeId(null);
                    setThemeUpgradeMessage('');
                    setSelectedTheme(theme.id);
                  }}
                  className={`relative text-left rounded-xl border-2 overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 ${
                    isSelected ? 'border-gray-900 shadow-md' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  aria-label={isLocked ? `${theme.name} theme locked on Free plan` : `${theme.name} theme`}
                >
                  {/* Visual Theme Image preview */}
                  <div className="h-32 w-full relative bg-gray-100">
                    <img 
                      src={theme.imageUrl} 
                      alt={`${theme.name} aesthetic`}
                      className="w-full h-full object-cover"
                    />
                    {/* Optional gradient overlay to ensure text/colors blend seamlessly */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>

                  {/* Label */}
                  <div className="px-3 py-2 border-t" style={{ borderColor: isSelected ? theme.preview.accent + '33' : '#f0f0f0' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-900">{theme.name}</span>
                        {theme.id !== 'classic' ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                            Pro
                          </span>
                        ) : null}
                      </div>
                      {isSelected && (
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-900">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight line-clamp-2">{theme.description}</p>
                  </div>
                  {isLocked && lockedThemeId === theme.id && themeUpgradeMessage ? (
                    <div className="pointer-events-none absolute inset-x-3 top-3 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-lg">
                      Upgrade to Pro to unlock all themes.
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          {themeUpgradeMessage ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              {themeUpgradeMessage}
            </p>
          ) : null}

          {/* Selected theme indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: THEMES.find(t => t.id === selectedTheme)?.preview.accent }}
            />
            <span>Active: <span className="font-semibold text-gray-700">{THEMES.find(t => t.id === selectedTheme)?.name}</span> theme</span>
          </div>
        </div>
      </div>

      {/* Save Bar */}
      <div className="mt-5 flex items-center justify-end gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-4">
        {saveStatus === 'saved' && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" /> Saved successfully
          </span>
        )}
        {saveError ? <span className="text-sm text-red-600">{saveError}</span> : null}
        <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Store Settings'}</Button>
      </div>

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </form>
  );
}
