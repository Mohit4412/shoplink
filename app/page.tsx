'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const router = useRouter()

  const handleUpgradeClick = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push('/signup')
    } else {
      router.push('/dashboard?upgrade=true')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-gray-900 font-sans selection:bg-gray-200 flex flex-col">
      {/* Header/Nav */}
      <nav className="max-w-5xl mx-auto w-full px-6 py-8 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tight text-black">YourBrand</div>
        <div className="flex gap-4 md:gap-6 items-center">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition">Log in</Link>
          <Link href="/signup" className="text-sm font-medium bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto w-full px-6 py-16 md:py-24 text-center flex-1">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-black mb-6 leading-[1.15]">
          Sell effortlessly on <br className="hidden md:block" /> Instagram & WhatsApp.
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
          Create a beautiful, lightning-fast mini boutique in seconds. Turn your followers into customers smoothly and professionally.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link href="/signup" className="inline-block bg-black text-white text-base font-medium px-8 py-3.5 rounded-xl hover:bg-gray-800 transition shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:-translate-y-0.5">
            Start for free
          </Link>
          <span className="text-sm text-gray-500 font-medium tracking-tight">No credit card required</span>
        </div>

        {/* Pricing Section */}
        <div className="mt-28 md:mt-36 max-w-4xl mx-auto text-left pb-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-black">Simple, transparent pricing</h2>
            <p className="text-gray-500 mt-3 text-lg font-medium">Start for free, upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch pt-4">
            {/* Free Plan */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col h-full transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <h3 className="text-xl font-semibold text-black">Free</h3>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-black tracking-tight">
                ₹0
                <span className="ml-2 text-base font-medium text-gray-400">/ forever</span>
              </div>
              <p className="mt-4 text-gray-500 text-sm font-medium leading-relaxed">Perfect for individuals checking out the platform and starting out.</p>

              <ul className="mt-8 space-y-4 flex-1">
                {[
                  'Up to 3 products',
                  'WhatsApp ordering',
                  'Basic analytics',
                  'Powered by branding',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <CheckIcon />
                    <span className="mt-0.5">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-6">
                <button onClick={handleUpgradeClick} className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
                  Get Free
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] border-[2.5px] border-black flex flex-col h-full relative transition-transform hover:-translate-y-1">
              <div className="absolute top-0 right-8 transform -translate-y-1/2">
                <span className="bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Most Popular</span>
              </div>
              <h3 className="text-xl font-semibold text-black">Pro</h3>
              <div className="mt-4 flex items-baseline text-6xl md:text-7xl font-black text-black tracking-tighter">
                ₹149
                <span className="ml-3 text-sm font-bold text-gray-400 tracking-wide uppercase">/ month</span>
              </div>
              <p className="mt-4 text-gray-500 text-sm font-medium leading-relaxed">For growing businesses and creators scaling their boutique.</p>

              <ul className="mt-8 space-y-4 flex-1">
                {[
                  'Unlimited products',
                  'Remove branding',
                  'Advanced analytics',
                  'Future theme customization',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <CheckIcon />
                    <span className="mt-0.5">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-6">
                <button onClick={handleUpgradeClick} className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 w-full text-center text-sm font-medium text-gray-400">
        <p>&copy; {new Date().getFullYear()} YourBrand. All rights reserved.</p>
      </footer>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-[18px] w-[18px] text-black shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}