'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Upload, Check } from 'lucide-react';
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
  cardAnatomy: 'portrait' | 'landscape' | 'square-overlay' | 'editorial-row';
  preview: { bg: string; card: string; accent: string; text: string; button: string };
}

// Mini SVG indicators for each card anatomy
function CardAnatomyIcon({ anatomy }: { anatomy: StoreTheme['cardAnatomy'] }) {
  if (anatomy === 'square-overlay') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
        <rect x="1" y="1" width="18" height="18" rx="2" fill="#e5e7eb" />
        <rect x="1" y="12" width="18" height="7" rx="0" fill="#374151" opacity="0.6" />
        <rect x="3" y="13.5" width="8" height="1.5" rx="1" fill="white" opacity="0.8" />
        <rect x="3" y="16" width="5" height="1" rx="0.5" fill="white" opacity="0.5" />
      </svg>
    );
  }
  if (anatomy === 'editorial-row') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
        <rect x="1" y="4" width="18" height="12" rx="2" fill="#e5e7eb" />
        <rect x="2" y="5" width="7" height="10" rx="1" fill="#9ca3af" />
        <rect x="11" y="7" width="7" height="1.5" rx="0.75" fill="#374151" opacity="0.7" />
        <rect x="11" y="10" width="5" height="1" rx="0.5" fill="#9ca3af" />
        <rect x="11" y="12.5" width="6" height="1" rx="0.5" fill="#9ca3af" />
      </svg>
    );
  }
  if (anatomy === 'landscape') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
        <rect x="1" y="3" width="18" height="14" rx="2" fill="#e5e7eb" />
        <rect x="2" y="4" width="16" height="8" rx="1" fill="#9ca3af" />
        <rect x="3" y="14" width="8" height="1.5" rx="0.75" fill="#374151" opacity="0.7" />
        <rect x="3" y="16.5" width="5" height="1" rx="0.5" fill="#9ca3af" />
      </svg>
    );
  }
  // portrait (default)
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <rect x="4" y="1" width="12" height="18" rx="2" fill="#e5e7eb" />
      <rect x="5" y="2" width="10" height="11" rx="1" fill="#9ca3af" />
      <rect x="5" y="14.5" width="7" height="1.5" rx="0.75" fill="#374151" opacity="0.7" />
      <rect x="5" y="17" width="4" height="1" rx="0.5" fill="#9ca3af" />
    </svg>
  );
}

const THEMES: StoreTheme[] = [
  { id: 'classic', name: 'Classic', cardAnatomy: 'portrait', description: 'Clean white with black accents. Timeless and professional.', imageUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=400&q=80', preview: { bg: '#FAFAFA', card: '#FFFFFF', accent: '#111111', text: '#374151', button: '#111111' } },
  { id: 'spark', name: '⚡ Spark', cardAnatomy: 'square-overlay', description: 'Instagram-grid feel with category tabs. Perfect for fashion & clothing.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80', preview: { bg: '#FFFFFF', card: '#FFFFFF', accent: '#0f0f0f', text: '#0f0f0f', button: '#0f0f0f' } },
  { id: 'craft', name: '🪡 Craft', cardAnatomy: 'editorial-row', description: 'Editorial storytelling for handmade & artisan goods. One product at a time.', imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80', preview: { bg: '#FDFCFB', card: '#FFFFFF', accent: '#c9a961', text: '#2d2d2d', button: '#2d2d2d' } },
  { id: 'fresh', name: '🌿 Fresh', cardAnatomy: 'landscape', description: 'Clean catalogue for food & homemade items. Quantity selectors built-in.', imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=400&q=80', preview: { bg: '#F8FAF6', card: '#FFFFFF', accent: '#4a7c2c', text: '#1a1a1a', button: '#4a7c2c' } },
];

type Tab = 'identity' | 'theme';

export function StoreSettings() {
  const { store, user, updateStoreSettings } = useStore();
  const upgradeModal = useUpgradeModal();
  const [activeTab, setActiveTab] = useState<Tab>('identity');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [selectedTheme, setSelectedTheme] = useState(store.theme || 'classic');
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
    currency: store.currency || 'INR',
  });

  const sanitizeName = (val: string) => val.trim().replace(/[<>"&]/g, '');

  // Sync selected theme when store data or plan loads/changes
  useEffect(() => {
    if (!user) return; // not yet hydrated — do nothing
    if (user.plan === 'Pro') {
      // Pro user: sync to whatever is saved in the store
      setSelectedTheme(store.theme || 'classic');
      setThemeUpgradeMessage('');
      setLockedThemeId(null);
      return;
    }
    // Free user: always lock to classic
    setSelectedTheme('classic');
    setLockedThemeId(null);
    setSaveStatus('idle');
  }, [user, store.theme]);

  const handleStoreSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    if (user?.plan === 'Free' && (selectedTheme !== 'classic' || lockedThemeId)) {
      setSaveStatus('idle');
      setThemeUpgradeMessage('Upgrade to Pro to save a premium theme.');
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
    <form onSubmit={handleStoreSave} className="space-y-4">

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {(['identity', 'theme'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === t
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      {/* Identity tab */}
      {activeTab === 'identity' && (
        <div className="space-y-5">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              {storeForm.logoUrl || store.logoUrl ? (
                <img
                  src={storeForm.logoUrl || store.logoUrl}
                  alt="Store Logo"
                  className="h-16 w-16 rounded-xl border border-gray-200 object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400 select-none">
                  {(storeForm.name || store.name || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <label
                htmlFor="logo-upload"
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Upload className="h-4 w-4 text-white" />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Store Logo</p>
              <p className="text-xs text-gray-400 mt-0.5">512×512px JPG or PNG</p>
              <input
                type="file"
                accept="image/*"
                id="logo-upload"
                className="hidden"
                onChange={(e) => void handleLogoUpload(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={isUploadingLogo}
                className="mt-2 h-8 px-3 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isUploadingLogo ? 'Uploading…' : 'Upload Logo'}
              </button>
              {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
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
            helperText={`Live at: https://${user?.username}.myshoplink.site`}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
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
            placeholder="Tell customers about your story and what you sell."
          />
        </div>
      )}

      {/* Theme tab */}
      {activeTab === 'theme' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">Choose a visual style for your public store page.</p>

          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              const isLocked = user?.plan === 'Free' && theme.id !== 'classic';
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      setSelectedTheme(theme.id);
                      setLockedThemeId(theme.id);
                      setThemeUpgradeMessage('Upgrade to Pro to unlock all themes.');
                      return;
                    }
                    setLockedThemeId(null);
                    setThemeUpgradeMessage('');
                    setSelectedTheme(theme.id);
                  }}
                  className={`relative text-left rounded-xl border-2 overflow-hidden transition-all focus:outline-none group ${
                    isSelected ? 'border-gray-900 shadow-md' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="h-24 w-full relative bg-gray-100">
                    <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    {/* Hover lock badge for Pro themes on Free plan */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
                          🔒 Pro
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 py-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-900">{theme.name}</span>
                        {theme.id !== 'classic' && (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">Pro</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <CardAnatomyIcon anatomy={theme.cardAnatomy} />
                        {isSelected && (
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-900 shrink-0">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight line-clamp-1">{theme.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {themeUpgradeMessage && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              {themeUpgradeMessage}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: THEMES.find(t => t.id === selectedTheme)?.preview.accent }}
            />
            <span>Active: <span className="font-semibold text-gray-700">{THEMES.find(t => t.id === selectedTheme)?.name}</span></span>
          </div>
        </div>
      )}

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-4 pb-2 flex items-center justify-between gap-3">
        <div className="text-sm">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          )}
          {saveError && <span className="text-red-500 text-xs">{saveError}</span>}
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </form>
  );
}
