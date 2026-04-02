'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { UpgradeModal, useUpgradeModal } from '../billing/UpgradeModal';
import { CheckCircle2 } from 'lucide-react';

interface StoreTheme {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cardAnatomy: 'portrait' | 'landscape' | 'square-overlay' | 'editorial-row';
  preview: { bg: string; accent: string };
}

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
  { id: 'classic', name: 'Classic', cardAnatomy: 'portrait', description: 'Clean white with black accents. Timeless and professional.', imageUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=400&q=80', preview: { bg: '#FAFAFA', accent: '#111111' } },
  { id: 'spark', name: '⚡ Spark', cardAnatomy: 'square-overlay', description: 'Instagram-grid feel with category tabs. Perfect for fashion & clothing.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80', preview: { bg: '#FFFFFF', accent: '#0f0f0f' } },
  { id: 'craft', name: '🪡 Craft', cardAnatomy: 'editorial-row', description: 'Editorial storytelling for handmade & artisan goods.', imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80', preview: { bg: '#FDFCFB', accent: '#c9a961' } },
  { id: 'fresh', name: '🌿 Fresh', cardAnatomy: 'landscape', description: 'Clean catalogue for food & homemade items. Quantity selectors built-in.', imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=400&q=80', preview: { bg: '#F8FAF6', accent: '#4a7c2c' } },
  { id: 'swift', name: '⚡ Swift', cardAnatomy: 'landscape', description: 'Compact list layout for electronics & accessories. Price-first display.', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80', preview: { bg: '#FAFAFA', accent: '#3b82f6' } },
  { id: 'noir', name: '◆ Noir', cardAnatomy: 'portrait', description: 'Dark luxury editorial for premium boutiques.', imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=400&q=80', preview: { bg: '#0a0a0a', accent: '#d4af37' } },
];

export function ThemeSettings() {
  const { store, user, updateStoreSettings } = useStore();
  const upgradeModal = useUpgradeModal();
  const [selectedTheme, setSelectedTheme] = useState(store.theme || 'classic');
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!user) return;
    if (user.plan === 'Pro') {
      setSelectedTheme(store.theme || 'classic');
      setUpgradeMessage('');
    } else {
      setSelectedTheme('classic');
    }
  }, [user, store.theme]);

  const handleSave = async () => {
    if (user?.plan === 'Free' && selectedTheme !== 'classic') {
      setUpgradeMessage('Upgrade to Pro to unlock all themes.');
      upgradeModal.open();
      return;
    }
    setSaveStatus('saving');
    setSaveError('');
    try {
      await updateStoreSettings({ theme: selectedTheme });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to save theme.');
      setSaveStatus('idle');
    }
  };

  return (
    <div className="w-full space-y-5">
      <p className="text-sm text-gray-500">Choose a visual style for your public store page.</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
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
                  setUpgradeMessage('Upgrade to Pro to unlock all themes.');
                  return;
                }
                setUpgradeMessage('');
                setSelectedTheme(theme.id);
              }}
              className={`relative w-full text-left rounded-2xl border-2 overflow-hidden transition-all focus:outline-none group min-h-[340px] ${
                isSelected ? 'border-gray-900 shadow-lg shadow-gray-200/80' : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
              }`}
            >
              <div className="h-48 w-full relative bg-gray-100">
                <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                {isLocked && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full">
                      🔒 Pro
                    </span>
                  </div>
                )}
              </div>
              <div className="px-3.5 py-3.5 border-t border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900">{theme.name}</span>
                    </div>
                    {theme.id !== 'classic' && (
                      <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">Pro</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <CardAnatomyIcon anatomy={theme.cardAnatomy} />
                    {isSelected && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-2">{theme.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {upgradeMessage && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          {upgradeMessage}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: THEMES.find(t => t.id === selectedTheme)?.preview.accent }} />
          <span>Active: <span className="font-semibold text-gray-700">{THEMES.find(t => t.id === selectedTheme)?.name}</span></span>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          {saveError && <span className="text-xs text-red-500">{saveError}</span>}
          <Button type="button" onClick={handleSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? 'Saving…' : 'Apply Theme'}
          </Button>
        </div>
      </div>

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </div>
  );
}
