'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { Store, Globe, CreditCard, User, LogOut, ChevronRight, ExternalLink, FileText } from 'lucide-react';

import { AccountSettings } from '../components/settings/AccountSettings';
import { StoreSettings } from '../components/settings/StoreSettings';
import { CustomDomainSettings } from '../components/settings/CustomDomainSettings';
import { BillingSettings } from '../components/settings/BillingSettings';
import { LegalPagesSettings } from '../components/settings/LegalPagesSettings';

export function Settings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useStore();
  const isTrialPro = user?.plan === 'Pro' && !user?.razorpaySubscriptionId;
  
  const view = searchParams?.get('view');

  if (view === 'store') return <StoreSettings />;
  if (view === 'domain') return <div className="mt-4"><CustomDomainSettings /></div>;
  if (view === 'billing') return <BillingSettings />;
  if (view === 'account') return <div className="mt-4"><AccountSettings /></div>;
  if (view === 'legal') return <div className="mt-4"><LegalPagesSettings /></div>;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const menuItems = [
    {
      id: 'store',
      title: 'Store settings',
      subtitle: 'Appearance, logo, theme',
      icon: <Store className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      id: 'domain',
      title: 'Custom domain',
      subtitle: 'Connect your own domain',
      icon: <Globe className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50',
    },
    {
      id: 'billing',
      title: 'Plans & pricing',
      subtitle: `Current plan: ${isTrialPro ? '14-day Pro trial' : user?.plan || 'Free'}`,
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50',
    },
    {
      id: 'legal',
      title: 'Legal pages',
      subtitle: 'Shipping, returns, privacy, terms',
      icon: <FileText className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50',
    },
    {
      id: 'account',
      title: 'Edit profile',
      subtitle: 'Name, email, WhatsApp number',
      icon: <User className="w-5 h-5 text-gray-600" />,
      bg: 'bg-gray-100',
    },
  ];

  return (
    <div className="space-y-6 pb-4">
      {/* Profile Card */}
      <div className="flex flex-col items-center pt-2 pb-6">
        <div className="w-16 h-16 rounded-full bg-[#059669] text-white flex items-center justify-center text-2xl font-bold shadow-sm mb-3">
          {user?.firstName ? user.firstName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h2 className="text-xl font-bold text-gray-900 leading-tight">
          {user?.firstName} {user?.lastName}
        </h2>
        <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
        
        <div className="flex items-center gap-2 mt-4">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider rounded-md">
            {isTrialPro ? 'PRO TRIAL' : user?.plan || 'FREE'}
          </span>
          <a 
            href={`https://${user?.username}.myshoplink.site`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 bg-[#ecfdf5] text-[#065f46] text-xs font-semibold rounded-md hover:bg-[#d1fae5] transition-colors"
          >
            View store <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100 border-b border-gray-100">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(`/settings?view=${item.id}`)}
              className="w-full flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0 mr-4`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-bold text-gray-900 leading-snug">{item.title}</h3>
                <p className="text-[13px] text-gray-500 font-medium leading-snug mt-0.5">{item.subtitle}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
            </button>
          ))}
        </div>
        
        {/* Logout Item */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-4 hover:bg-red-50 active:bg-red-100 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 mr-4">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-red-600 leading-snug">Log out</h3>
          </div>
        </button>
      </div>
    </div>
  );
}
