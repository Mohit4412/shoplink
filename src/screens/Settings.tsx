'use client';

import React, { useState, useEffect } from 'react';
import { AccountSettings } from '../components/settings/AccountSettings';
import { StoreSettings } from '../components/settings/StoreSettings';
import { PluginsSettings } from '../components/settings/PluginsSettings';
import { CustomDomainSettings } from '../components/settings/CustomDomainSettings';
import { BillingSettings } from '../components/settings/BillingSettings';

type Tab = 'account' | 'store' | 'plugins' | 'domain' | 'billing';

const TABS: { id: Tab; label: string }[] = [
  { id: 'account', label: 'Profile' },
  { id: 'store',   label: 'Store'   },
  { id: 'plugins', label: 'Plugins' },
  { id: 'domain',  label: 'Domain'  },
  { id: 'billing', label: 'Billing' },
];

const TAB_TITLES: Record<Tab, string> = {
  account: 'Settings',
  store:   'Store Settings',
  plugins: 'Storefront Plugins',
  domain:  'Domain Settings',
  billing: 'Billing & Subscription',
};

const TAB_DESCRIPTIONS: Record<Tab, string> = {
  account: 'Manage your personal account preferences.',
  store:   "Configure your store's identity and visual appearance.",
  plugins: 'Toggle which sections appear on your public storefront.',
  domain:  'Manage your custom domain and DNS settings.',
  billing: 'Manage your subscription, billing history, and payment methods.',
};

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'account';
    return (window.localStorage.getItem('settingsTab') as Tab) || 'account';
  });

  useEffect(() => {
    window.localStorage.setItem('settingsTab', activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{TAB_TITLES[activeTab]}</h1>
        <p className="text-sm text-gray-500 mt-1">{TAB_DESCRIPTIONS[activeTab]}</p>
      </div>

      {/* Full-width tabs — equal columns */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px grid grid-cols-5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors text-center ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'account'  && <AccountSettings onTabChange={setActiveTab} />}
      {activeTab === 'store'    && <StoreSettings />}
      {activeTab === 'plugins'  && <PluginsSettings />}
      {activeTab === 'domain'   && <CustomDomainSettings />}
      {activeTab === 'billing'  && <BillingSettings />}
    </div>
  );
}
