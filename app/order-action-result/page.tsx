import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function OrderActionResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const confirmed = status === 'confirmed';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-sans">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-10 max-w-sm w-full text-center">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${confirmed ? 'bg-emerald-50' : 'bg-red-50'}`}>
          {confirmed
            ? <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            : <XCircle className="h-7 w-7 text-red-500" />
          }
        </div>
        <h1 className="text-lg font-bold text-gray-900">
          {confirmed ? 'Order confirmed' : 'Order declined'}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {confirmed
            ? 'The order has been marked as confirmed. The customer will be notified.'
            : 'The order has been declined.'}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
