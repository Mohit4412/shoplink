'use client';

import { CheckCircle2, Mail, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SignupSuccessProps {
  firstName: string;
  username: string;
  email: string;
}

export function SignupSuccess({ firstName, username, email }: SignupSuccessProps) {
  const router = useRouter();
  
  const storeUrl = `https://${username}.myshoplink.site`;

  return (
    <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="w-20 h-20 bg-[#ecfdf5] rounded-full flex items-center justify-center border-8 border-white shadow-sm mb-6 mt-4">
        <CheckCircle2 className="w-10 h-10 text-[#059669]" />
      </div>

      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Store created!</h1>
      <p className="text-base text-gray-500 mb-8 max-w-sm">
        Welcome, {firstName || 'there'}.<br />
        Your store is ready at <span className="font-semibold text-gray-700">{username}.myshoplink.site</span>
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full mb-8 text-left flex gap-3">
        <div className="mt-0.5">
          <Mail className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-900">Verify your email</h3>
          <p className="text-sm font-semibold text-amber-700 mt-0.5">{email}</p>
          <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
            We'll send a verification link when email verification is enabled. For now you can go straight to your dashboard.
          </p>
        </div>
      </div>

      <button 
        onClick={() => router.push('/dashboard')}
        className="w-full h-[52px] rounded-xl bg-[#059669] text-white font-semibold text-lg hover:bg-[#047857] flex items-center justify-center transition-all shadow-lg shadow-[#059669]/20 mb-4"
      >
        Go to my dashboard
      </button>

      <a 
        href={storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1.5"
      >
        View my store <ExternalLink className="w-4 h-4" />
      </a>
      
    </div>
  );
}
