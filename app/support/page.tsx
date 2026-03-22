import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">Support</div>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">Need help with your store?</h1>
        <p className="mt-4 text-base leading-8 text-gray-600">
          Reach the MyShopLink team at{' '}
          <a className="font-semibold text-gray-900 underline underline-offset-4" href="mailto:support@myshoplink.site">
            support@myshoplink.site
          </a>
          {' '}for setup help, billing questions, or storefront issues.
        </p>
      </div>
    </div>
  );
}
