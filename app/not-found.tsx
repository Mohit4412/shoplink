import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.28em] text-gray-400">404 Error</div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">This MyShopLink page could not be found</h1>
        <p className="mt-3 text-base leading-7 text-gray-600">
          The page may have moved, the store link may be incorrect, or the product is no longer available.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
            Go to MyShopLink
          </Link>
          <Link href="/signup" className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            Create a store
          </Link>
        </div>
      </div>
    </div>
  );
}
