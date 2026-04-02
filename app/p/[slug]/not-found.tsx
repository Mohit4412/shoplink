import Link from 'next/link';
import { PackageX } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <PackageX className="h-8 w-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Product not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          This product link may have expired or the item is no longer available.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
