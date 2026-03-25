'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { getTheme } from '../../utils/themes';
import { SectionConfig } from '../../types';
import {
  Zap, Eye, EyeOff, ExternalLink, ChevronDown, ChevronUp,
  ShieldCheck, CheckCircle2, Truck, Award, Star, Heart, RotateCcw,
  Box, Package, CreditCard, Clock, Lock, Headphones, Gift, Leaf,
  ThumbsUp, Flame, BadgeCheck, Sparkles, Smile,
  MapPin, Globe, Recycle, Tag, Percent, Handshake,
  ArrowUp, ArrowDown, Plus, Trash2, Settings2,
} from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'ShieldCheck',  label: 'Shield',    icon: ShieldCheck },
  { value: 'CheckCircle2', label: 'Check',     icon: CheckCircle2 },
  { value: 'BadgeCheck',   label: 'Badge',     icon: BadgeCheck },
  { value: 'Truck',        label: 'Truck',     icon: Truck },
  { value: 'Package',      label: 'Package',   icon: Package },
  { value: 'Box',          label: 'Box',       icon: Box },
  { value: 'RotateCcw',    label: 'Returns',   icon: RotateCcw },
  { value: 'Recycle',      label: 'Recycle',   icon: Recycle },
  { value: 'CreditCard',   label: 'Payment',   icon: CreditCard },
  { value: 'Lock',         label: 'Secure',    icon: Lock },
  { value: 'Award',        label: 'Award',     icon: Award },
  { value: 'Star',         label: 'Star',      icon: Star },
  { value: 'Sparkles',     label: 'Sparkles',  icon: Sparkles },
  { value: 'Flame',        label: 'Hot',       icon: Flame },
  { value: 'Zap',          label: 'Fast',      icon: Zap },
  { value: 'Clock',        label: 'Clock',     icon: Clock },
  { value: 'Headphones',   label: 'Support',   icon: Headphones },
  { value: 'Heart',        label: 'Heart',     icon: Heart },
  { value: 'ThumbsUp',     label: 'Thumbs Up', icon: ThumbsUp },
  { value: 'Smile',        label: 'Happy',     icon: Smile },
  { value: 'Gift',         label: 'Gift',      icon: Gift },
  { value: 'Tag',          label: 'Tag',       icon: Tag },
  { value: 'Percent',      label: 'Discount',  icon: Percent },
  { value: 'Leaf',         label: 'Eco',       icon: Leaf },
  { value: 'Globe',        label: 'Global',    icon: Globe },
  { value: 'MapPin',       label: 'Location',  icon: MapPin },
  { value: 'Handshake',    label: 'Trusted',   icon: Handshake },
];

const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(
  ICON_OPTIONS.map(o => [o.value, o.icon])
);

const SECTION_META: Record<string, { emoji: string; desc: string }> = {
  'hero':         { emoji: '🏠', desc: 'Full-width banner with store name and tagline' },
  'featured':     { emoji: '⭐', desc: 'Highlights your top products prominently' },
  'all-products': { emoji: '🛍️', desc: 'Complete scrollable product catalogue' },
  'about':        { emoji: '📖', desc: 'Your store story and bio' },
  'whatsapp-cta': { emoji: '💬', desc: 'Prominent chat button encouraging orders' },
};

interface SettingsField {
  key: keyof NonNullable<SectionConfig['settings']>;
  label: string;
  placeholder: string;
}

const SECTION_SETTINGS_FIELDS: Record<string, SettingsField[]> = {
  'hero': [
    { key: 'ctaText', label: 'Button label', placeholder: 'e.g. Shop Now' },
  ],
  'featured': [
    { key: 'heading', label: 'Section heading', placeholder: 'e.g. Featured Highlights' },
  ],
  'about': [
    { key: 'heading', label: 'Section heading', placeholder: 'e.g. About Us' },
    { key: 'subtext', label: 'Description', placeholder: 'e.g. We craft quality products...' },
  ],
  'whatsapp-cta': [
    { key: 'heading',  label: 'Heading',      placeholder: "e.g. Questions? We're on WhatsApp 💬" },
    { key: 'subtext',  label: 'Subtext',      placeholder: 'e.g. Chat to place an order or ask anything.' },
    { key: 'ctaText',  label: 'Button label', placeholder: 'e.g. Chat to Order' },
  ],
};

export function PluginsSettings() {
  const { store, user, updateStoreSettings } = useStore();

  const theme = getTheme(store.theme);
  const resolvedSections: SectionConfig[] = store.sections?.length
    ? store.sections
    : theme.defaultSections;

  const [sections, setSections] = useState<SectionConfig[]>(resolvedSections);
  const [expanded, setExpanded] = useState<string | null>(null);

  const defaultBadges = [
    { text: '7-Day Easy Returns', icon: 'ShieldCheck' },
    { text: 'Top Rated Seller',   icon: 'CheckCircle2' },
    { text: 'Fast Free Shipping', icon: 'Truck' },
  ];
  const getNormalizedBadges = () =>
    (store.trustBadges || defaultBadges).map((b: any, idx: number) =>
      typeof b === 'string' ? { text: b, icon: defaultBadges[idx]?.icon ?? 'ShieldCheck' } : b
    );
  const [badges, setBadges] = useState<{ text: string; icon: string }[]>(getNormalizedBadges());
  const [badgesExpanded, setBadgesExpanded] = useState(false);

  useEffect(() => {
    const source = store.sections?.length ? store.sections : theme.defaultSections;
    setSections(source);
    setBadges(getNormalizedBadges());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.sections, store.theme, store.trustBadges]);

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  const handleToggle = (id: SectionConfig['id']) => {
    const updated = sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSections(updated);
    void updateStoreSettings({ sections: updated });
  };

  const handleMove = (id: SectionConfig['id'], dir: 'up' | 'down') => {
    const s = [...sections].sort((a, b) => a.order - b.order);
    const idx = s.findIndex(x => x.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= s.length) return;
    const updated = sections.map(sec => {
      if (sec.id === s[idx].id) return { ...sec, order: s[swapIdx].order };
      if (sec.id === s[swapIdx].id) return { ...sec, order: s[idx].order };
      return sec;
    });
    setSections(updated);
    void updateStoreSettings({ sections: updated });
  };

  const handleSettingChange = (id: SectionConfig['id'], key: string, value: string) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, settings: { ...(s.settings ?? {}), [key]: value } } : s)
    );
  };

  const handleSettingBlur = () => {
    void updateStoreSettings({ sections });
  };

  const handleBadgeIconChange = (i: number, iconValue: string) => {
    const nb = [...badges];
    nb[i] = { ...nb[i], icon: iconValue };
    setBadges(nb);
    void updateStoreSettings({ trustBadges: nb as any });
  };
  const handleBadgeTextChange = (i: number, val: string) => {
    const nb = [...badges];
    nb[i] = { ...nb[i], text: val };
    setBadges(nb);
  };
  const handleBadgeBlur = () => void updateStoreSettings({ trustBadges: badges as any });
  const addBadge = () => {
    if (badges.length >= 6) return;
    const nb = [...badges, { text: '', icon: 'ShieldCheck' }];
    setBadges(nb);
    void updateStoreSettings({ trustBadges: nb as any });
  };
  const removeBadge = (i: number) => {
    const nb = badges.filter((_, idx) => idx !== i);
    setBadges(nb);
    void updateStoreSettings({ trustBadges: nb as any });
  };

  return (
    <div className="space-y-3">

      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-bold text-gray-900">Storefront Plugins</p>
          <p className="text-xs text-gray-400 mt-0.5">Toggle, reorder, and configure each section.</p>
        </div>
        {user?.username && (
          <a
            href={`https://${user.username}.myshoplink.site`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview
          </a>
        )}
      </div>

      {sorted.map((section, idx) => {
        const meta = SECTION_META[section.id];
        const fields = SECTION_SETTINGS_FIELDS[section.id] ?? [];
        const isExpanded = expanded === section.id;
        const hasSettings = fields.length > 0;

        return (
          <div
            key={section.id}
            className={`bg-white border rounded-2xl overflow-hidden transition-all ${
              section.enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => handleMove(section.id, 'up')}
                  disabled={idx === 0}
                  className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleMove(section.id, 'down')}
                  disabled={idx === sorted.length - 1}
                  className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              <span className="text-lg shrink-0 select-none">{meta?.emoji ?? '🔧'}</span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{section.label}</p>
                <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{meta?.desc}</p>
              </div>

              {hasSettings && (
                <button
                  onClick={() => setExpanded(isExpanded ? null : section.id)}
                  className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                    isExpanded ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Configure"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                role="switch"
                aria-checked={section.enabled}
                onClick={() => handleToggle(section.id)}
                className={`shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  section.enabled ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${section.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {isExpanded && hasSettings && (
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2.5">
                {fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      {field.label}
                    </label>
                    <input
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent placeholder:text-gray-300"
                      placeholder={field.placeholder}
                      value={(section.settings as any)?.[field.key] ?? ''}
                      onChange={e => handleSettingChange(section.id, field.key, e.target.value)}
                      onBlur={handleSettingBlur}
                    />
                  </div>
                ))}
                <p className="text-[10px] text-gray-400">Leave blank to use the default text.</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Trust Badges card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <button
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
          onClick={() => setBadgesExpanded(v => !v)}
        >
          <span className="text-lg shrink-0">🛡️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">Trust Badges</p>
            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
              Shown on product pages · {badges.filter(b => b.text.trim()).length} active
            </p>
          </div>
          {badgesExpanded
            ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
            : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
        </button>

        {badgesExpanded && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
            <div className="flex items-center justify-around bg-white border border-gray-100 rounded-xl px-3 py-2 mb-1">
              {badges.filter(b => b.text.trim()).map((b, i) => {
                const IconComp = (ICON_MAP[b.icon] ?? ShieldCheck) as React.ElementType;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <IconComp className="w-4 h-4 text-gray-600" />
                    <span className="text-[9px] text-gray-500 font-medium text-center leading-tight max-w-[56px] truncate">{b.text}</span>
                  </div>
                );
              })}
              {badges.filter(b => b.text.trim()).length === 0 && (
                <p className="text-[11px] text-gray-400 py-1">No active badges</p>
              )}
            </div>
            <p className="text-[10px] text-gray-400 text-center -mt-1 mb-2">Preview</p>

            {badges.map((badge, i) => {
              const CurrentIcon = (ICON_MAP[badge.icon] ?? ShieldCheck) as React.ElementType;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1.5 shrink-0">
                    <CurrentIcon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <select
                      className="bg-transparent text-xs text-gray-700 outline-none border-none focus:outline-none focus:ring-0 cursor-pointer max-w-[72px]"
                      value={badge.icon}
                      onChange={e => handleBadgeIconChange(i, e.target.value)}
                    >
                      {ICON_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    className="flex-1 h-8 px-2.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent placeholder:text-gray-300"
                    placeholder="e.g. 7-Day Returns"
                    value={badge.text}
                    onChange={e => handleBadgeTextChange(i, e.target.value)}
                    onBlur={handleBadgeBlur}
                  />
                  <button
                    onClick={() => removeBadge(i)}
                    className="p-1.5 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {badges.length < 6 && (
              <button
                onClick={addBadge}
                className="w-full h-8 rounded-lg border border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-1.5 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add badge
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-400 text-right pt-1">
        {sorted.filter(s => s.enabled).length} of {sorted.length} sections active
      </p>
    </div>
  );
}
