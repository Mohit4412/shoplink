'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { getStoreUrl } from '../utils/storeUrl';
import { Store, Globe, CreditCard, User, ExternalLink, FileText, ChevronLeft, Wallet } from 'lucide-react';

import { AccountSettings } from '../components/settings/AccountSettings';
import { StoreSettings } from '../components/settings/StoreSettings';
import { CustomDomainSettings } from '../components/settings/CustomDomainSettings';
import { BillingSettings } from '../components/settings/BillingSettings';
import { LegalPagesSettings } from '../components/settings/LegalPagesSettings';
import { PaymentsSettings } from '../components/settings/PaymentsSettings';

const SECTIONS = [
  {
    id: 'store',
    title: 'Store',
    subtitle: 'Name, logo, tagline, bio',
    group: 'Storefront',
    icon: Store,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    id: 'domain',
    title: 'Custom Domain',
    subtitle: 'Connect your own domain',
    group: 'Storefront',
    icon: Globe,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
  },
  {
    id: 'legal',
    title: 'Legal Pages',
    subtitle: 'Shipping, returns, privacy',
    group: 'Storefront',
    icon: FileText,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
  },
  {
    id: 'payments',
    title: 'Payments',
    subtitle: 'Stripe checkout, UPI, bank transfer',
    group: 'Storefront',
    icon: Wallet,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
  {
    id: 'billing',
    title: 'Plans & Billing',
    subtitle: 'Subscription, upgrade',
    group: 'Workspace',
    icon: CreditCard,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
  {
    id: 'account',
    title: 'Account',
    subtitle: 'Profile, email, WhatsApp',
    group: 'Workspace',
    icon: User,
    iconColor: 'text-zinc-600',
    iconBg: 'bg-zinc-100',
  },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

function SectionContent({ view }: { view: SectionId }) {
  if (view === 'store') return <StoreSettings />;
  if (view === 'domain') return <CustomDomainSettings />;
  if (view === 'payments') return <PaymentsSettings />;
  if (view === 'billing') return <BillingSettings />;
  if (view === 'legal') return <LegalPagesSettings />;
  if (view === 'account') return <AccountSettings />;
  return null;
}

export function Settings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStore();

  const view = (searchParams?.get('view') ?? '') as SectionId | '';
  const activeSection = SECTIONS.find((section) => section.id === view) ?? SECTIONS[0];

  return (
    <div className="w-full max-w-[1120px]">
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-zinc-200 pb-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 ${activeSection.iconBg}`}>
                <activeSection.icon style={{ width: 18, height: 18 }} className={activeSection.iconColor} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{activeSection.group}</p>
                <h2 className="mt-0.5 text-base font-semibold leading-tight tracking-tight text-zinc-900">{activeSection.title}</h2>
                <p className="mt-0.5 text-xs font-medium text-zinc-500">{activeSection.subtitle}</p>
              </div>
            </div>
            {user?.username && (
              <a
                href={getStoreUrl(user.username)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                View store
                <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
              </a>
            )}
          </div>
          <SectionContent view={activeSection.id} />
        </div>
      </div>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 ${activeSection.iconBg}`}>
              <activeSection.icon style={{ width: 18, height: 18 }} className={activeSection.iconColor} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{activeSection.group}</p>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{activeSection.title}</h2>
            </div>
          </div>
          {user?.username && (
            <a
              href={getStoreUrl(user.username)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              View store <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
            </a>
          )}
        </div>
        <SectionContent view={activeSection.id} />
      </div>
    </div>
  );
}
