'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { LegalPages } from '../../types';
import { FileText, Truck, RotateCcw, Shield, Scale, ChevronDown, ChevronUp, Check, ExternalLink } from 'lucide-react';

interface PageDef {
  key: keyof LegalPages;
  title: string;
  icon: React.ReactNode;
  description: string;
  placeholder: string;
}

const LEGAL_PAGES: PageDef[] = [
  {
    key: 'shipping',
    title: 'Shipping Policy',
    icon: <Truck className="w-5 h-5 text-blue-600" />,
    description: 'Delivery timelines, costs, regions you ship to',
    placeholder: `Example:

We process orders within 1–2 business days.

Standard delivery: 5–7 business days across India.
Express delivery: 1–3 business days (additional charges apply).

Shipping is free on orders above ₹999.
For remote areas, allow up to 10 business days.

Once shipped, you will receive a tracking number via WhatsApp.`,
  },
  {
    key: 'returns',
    title: 'Returns & Refunds',
    icon: <RotateCcw className="w-5 h-5 text-orange-600" />,
    description: 'How customers can return or exchange items',
    placeholder: `Example:

We accept returns within 7 days of delivery.

Items must be unused, unwashed, and in original packaging.
To initiate a return, message us on WhatsApp with your order details and photos.

Refunds are processed within 5–7 business days after we receive the item.

The following items are non-returnable:
- Customised or personalised products
- Perishable goods
- Items on sale`,
  },
  {
    key: 'privacy',
    title: 'Privacy Policy',
    icon: <Shield className="w-5 h-5 text-green-600" />,
    description: 'How you collect and use customer data',
    placeholder: `Example:

We collect only the information needed to process your order — your name, phone number, and delivery address.

We do not sell or share your personal data with third parties.

Your WhatsApp number is used solely to communicate about your order.

By shopping with us, you agree to this privacy policy.`,
  },
  {
    key: 'terms',
    title: 'Terms of Service',
    icon: <Scale className="w-5 h-5 text-purple-600" />,
    description: 'General rules and conditions of purchase',
    placeholder: `Example:

By placing an order with us, you agree to the following terms:

1. All prices are in Indian Rupees (₹) and inclusive of applicable taxes.
2. Orders are confirmed only after payment is received.
3. We reserve the right to cancel any order due to stock unavailability.
4. In case of a dispute, we will first try to resolve it amicably.
5. These terms are governed by the laws of India.`,
  },
];

const AUTO_SAVE_DELAY = 1200;

export function LegalPagesSettings() {
  const { store, user, updateStoreSettings } = useStore();
  const [expanded, setExpanded] = useState<keyof LegalPages | null>('shipping');
  const [draft, setDraft] = useState<LegalPages>({
    shipping: '',
    returns: '',
    privacy: '',
    terms: '',
    ...store.legalPages,
  });
  const [saveStatus, setSaveStatus] = useState<Record<keyof LegalPages, 'idle' | 'saving' | 'saved'>>({
    shipping: 'idle',
    returns: 'idle',
    privacy: 'idle',
    terms: 'idle',
  });

  // Sync from store when context loads
  useEffect(() => {
    if (store.legalPages) {
      setDraft(prev => ({ ...prev, ...store.legalPages }));
    }
  }, [store.legalPages]);

  // Autosave per-field with debounce
  const handleChange = (key: keyof LegalPages, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }));
    setSaveStatus(prev => ({ ...prev, [key]: 'saving' }));
  };

  const handleBlur = async (key: keyof LegalPages) => {
    setSaveStatus(prev => ({ ...prev, [key]: 'saving' }));
    try {
      await updateStoreSettings({ legalPages: { ...draft } });
      setSaveStatus(prev => ({ ...prev, [key]: 'saved' }));
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [key]: 'idle' })), 2000);
    } catch {
      setSaveStatus(prev => ({ ...prev, [key]: 'idle' }));
    }
  };

  const filledCount = LEGAL_PAGES.filter(p => draft[p.key]?.trim()).length;

  return (
    <div className="space-y-2 pb-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900">Legal Pages</p>
          <p className="text-xs text-gray-400 mt-0.5">{filledCount} of {LEGAL_PAGES.length} pages filled</p>
        </div>
        {user?.username && (
          <a
            href={`https://${user.username}.myshoplink.site`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview store
          </a>
        )}
      </div>

      {/* Page cards */}
      {LEGAL_PAGES.map((page) => {
        const isOpen = expanded === page.key;
        const isFilled = Boolean(draft[page.key]?.trim());
        const status = saveStatus[page.key];

        return (
          <div
            key={page.key}
            className={`bg-white rounded-2xl border overflow-hidden transition-all ${
              isOpen ? 'border-gray-300' : 'border-gray-100'
            }`}
          >
            {/* Card header — toggle */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(isOpen ? null : page.key)}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isFilled ? 'bg-emerald-50' : 'bg-gray-50'
              }`}>
                {page.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-bold text-gray-900 leading-tight">{page.title}</p>
                  {isFilled && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                      <Check className="w-2.5 h-2.5" /> Filled
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-gray-400 leading-tight mt-0.5">{page.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {status === 'saving' && (
                  <span className="text-[10px] text-gray-400 font-medium">Saving…</span>
                )}
                {status === 'saved' && (
                  <span className="text-[10px] text-emerald-600 font-bold">Saved ✓</span>
                )}
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </div>
            </button>

            {/* Editor */}
            {isOpen && (
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/60">
                <textarea
                  className="w-full min-h-[220px] text-sm text-gray-800 bg-white border border-gray-200 rounded-xl px-3.5 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-300 leading-relaxed"
                  placeholder={page.placeholder}
                  value={draft[page.key] ?? ''}
                  onChange={(e) => handleChange(page.key, e.target.value)}
                  onBlur={() => handleBlur(page.key)}
                />
                <p className="text-[11px] text-gray-400 mt-2">
                  Changes are saved automatically when you click away.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Info footer */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5 flex items-start gap-3">
        <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[12px] text-blue-700 leading-relaxed">
          These pages are linked in your store footer. Customers can read your policies before placing an order, which builds trust and reduces disputes.
        </p>
      </div>
    </div>
  );
}
