'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { getTheme } from '../../utils/themes';
import { SectionConfig } from '../../types';
import { Zap, Eye, EyeOff, Info, ExternalLink, ShieldCheck, CheckCircle2, Truck, Trash2, Award, Star, Heart, RotateCcw, Box, Package, CreditCard, Clock } from 'lucide-react';
import { Input } from '../ui/Input';

const ICON_OPTIONS = [
  { value: 'ShieldCheck', label: 'Shield', icon: ShieldCheck },
  { value: 'CheckCircle2', label: 'Checkmark', icon: CheckCircle2 },
  { value: 'Truck', label: 'Truck', icon: Truck },
  { value: 'Award', label: 'Award', icon: Award },
  { value: 'Star', label: 'Star', icon: Star },
  { value: 'Heart', label: 'Heart', icon: Heart },
  { value: 'RotateCcw', label: 'Returns', icon: RotateCcw },
  { value: 'Box', label: 'Box', icon: Box },
  { value: 'Package', label: 'Package', icon: Package },
  { value: 'Zap', label: 'Lightning', icon: Zap },
  { value: 'CreditCard', label: 'Payment', icon: CreditCard },
  { value: 'Clock', label: 'Clock', icon: Clock },
];

// Icon map for each section id
const SECTION_ICONS: Record<string, string> = {
  'hero':         '🏠',
  'featured':     '⭐',
  'all-products': '🛍️',
  'about':        '📖',
  'whatsapp-cta': '💬',
};

// One-line descriptions for each section
const SECTION_DESCRIPTIONS: Record<string, string> = {
  'hero':         'Full-width banner with your store name and tagline',
  'featured':     'Highlights your top 4 products prominently',
  'all-products': 'Complete scrollable product catalogue',
  'about':        'Your store story and bio',
  'whatsapp-cta': 'Prominent chat button encouraging orders',
};

export function PluginsSettings() {
  const { store, user, updateStoreSettings } = useStore();

  // Resolve sections from store or fall back to theme defaults
  const theme = getTheme(store.theme);
  const resolvedSections: SectionConfig[] = store.sections?.length
    ? store.sections
    : theme.defaultSections;

  const [sections, setSections] = useState<SectionConfig[]>(resolvedSections);

  // Trust Badges State
  const defaultBadges = [
    { text: '7-Day Easy Returns', icon: 'ShieldCheck' },
    { text: 'Top Rated Seller', icon: 'CheckCircle2' },
    { text: 'Fast Free Shipping', icon: 'Truck' }
  ];
  
  const getNormalizedBadges = () => {
    return (store.trustBadges || defaultBadges).map((b: any, idx: number) => {
      if (typeof b === 'string') return { text: b, icon: defaultBadges[idx].icon };
      return b;
    });
  };

  const [badges, setBadges] = useState<{text: string, icon: string}[]>(getNormalizedBadges());

  // Sync if store changes externally
  useEffect(() => {
    const source = store.sections?.length ? store.sections : theme.defaultSections;
    setSections(source);
    setBadges(getNormalizedBadges());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.sections, store.theme, store.trustBadges]);

  const handleBadgeChange = (index: number, val: string) => {
    const newBadges = [...badges];
    newBadges[index] = { ...newBadges[index], text: val || '' };
    setBadges(newBadges);
  };
  
  const handleBadgeIconChange = (index: number, iconValue: string) => {
    const newBadges = [...badges];
    newBadges[index] = { ...newBadges[index], icon: iconValue };
    setBadges(newBadges);
    void updateStoreSettings({ trustBadges: newBadges as any }); // save immediately on select
  };

  const handleBadgeBlur = () => {
    void updateStoreSettings({ trustBadges: badges as any });
  };

  const clearBadge = (index: number) => {
    const newBadges = [...badges];
    newBadges[index] = { ...newBadges[index], text: '' };
    setBadges(newBadges);
    void updateStoreSettings({ trustBadges: newBadges as any });
  };

  const handleToggle = (id: SectionConfig['id']) => {
    const updated = sections.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSections(updated);
    void updateStoreSettings({ sections: updated });
  };

  // Sort by order for display
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-2xl space-y-5">

      {/* Header row — title + Preview Store button */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Storefront Sections</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Enable or disable sections displayed on your public storefront page.
            </p>
          </div>
        </div>

        {/* Preview Store button */}
        {user?.username && (
          <a
            href={`/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview Store
          </a>
        )}
      </div>

      {/* Live-update notice */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <p className="text-xs text-blue-700 font-medium">
          Changes reflect instantly on your public store.
        </p>
      </div>

      {/* Section toggle list */}
      <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
        {sorted.map((section) => (
          <div
            key={section.id}
            className="flex items-center justify-between px-5 py-4 group hover:bg-gray-50 transition-colors"
          >
            {/* Left — icon + label + description + visibility badge */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl select-none shrink-0" aria-hidden="true">
                {SECTION_ICONS[section.id] ?? '🔧'}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{section.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                  {SECTION_DESCRIPTIONS[section.id] ?? `Position ${section.order}`}
                </p>
                <p className="text-xs mt-0.5">
                  {section.enabled ? (
                    <span className="inline-flex items-center gap-0.5 text-green-500 font-medium">
                      <Eye className="w-3 h-3" /> Visible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-orange-400 font-medium">
                      <EyeOff className="w-3 h-3" /> Hidden
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right — toggle switch */}
            <button
              role="switch"
              aria-checked={section.enabled}
              onClick={() => handleToggle(section.id)}
              className={`shrink-0 ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                section.enabled
                  ? 'bg-gray-900 focus:ring-gray-900'
                  : 'bg-gray-200 focus:ring-gray-400'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  section.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Trust Badges Config */}
      <div className="pt-6 border-t border-gray-100">
        <div className="flex items-start gap-4 mb-5">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Product Trust Badges</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Customize the three trust badges displayed on your product pages. Changes save automatically.
            </p>
          </div>
        </div>
        
        <div className="bg-white border text-sm border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          {[0, 1, 2].map((i) => {
            const badge = badges[i];
            const CurrentIcon = ICON_OPTIONS.find(opt => opt.value === badge.icon)?.icon || ShieldCheck;
            
            return (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                 <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200 shrink-0 w-full sm:w-auto">
                    <CurrentIcon className="w-5 h-5 text-gray-500 shrink-0 mx-1" />
                    <select
                      className="bg-transparent text-sm text-gray-700 outline-none border-none py-1 focus:outline-none focus:ring-0 flex-1 cursor-pointer"
                      value={badge.icon}
                      onChange={(e) => handleBadgeIconChange(i, e.target.value)}
                    >
                      {ICON_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                 </div>
                 <div className="flex-1 w-full relative">
                   <Input 
                     placeholder="e.g. 7-Day Easy Returns"
                     value={badge.text}
                     onChange={(e) => handleBadgeChange(i, e.target.value)}
                     onBlur={handleBadgeBlur}
                   />
                 </div>
                 <button onClick={() => clearBadge(i)} className="text-gray-400 self-end sm:self-auto hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-50 shrink-0 -mt-1 sm:mt-0" title="Delete Badge">
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-gray-400 text-right">
        {sorted.filter(s => s.enabled).length} of {sorted.length} sections active
      </p>
    </div>
  );
}
