'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  Link as LinkIcon, 
  MessageCircle, 
  Palette, 
  BarChart3, 
  CheckCircle2, 
  Package, 
  ChevronDown, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone,
  Facebook,
  Instagram,
  ShoppingBag,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';

export function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCTA = () => router.push('/signup');
  const handleLogin = () => router.push('/signup?mode=login');
  const handleDemo = () => router.push('/demo');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Do my customers need to download an app or sign up?",
      a: "No. Your customers just click your MyShopLink URL and browse your store in their browser — no app, no signup, no friction."
    },
    {
      q: "How does WhatsApp ordering work?",
      a: "Every product on your store has an \"Order via WhatsApp\" button. When a customer taps it, WhatsApp opens on their phone with a pre-filled message including the product name and price. They just hit send and you're talking."
    },
    {
      q: "Do I need a website or technical knowledge?",
      a: "None at all. If you can use Instagram, you can use MyShopLink. Your store is live in under 5 minutes."
    },
    {
      q: "What happens to my orders?",
      a: "Every WhatsApp tap creates a pending order in your MyShopLink dashboard. You can confirm or decline it, and track your revenue — all in one place."
    },
    {
      q: "Can I use my own domain name?",
      a: "Yes — custom domain is a Pro feature. Your store can be at yourname.com instead of yourname.myshoplink.site."
    },
    {
      q: "Is my store link safe to share on Instagram?",
      a: "Completely. Your store is a regular website URL — safe to put in your Instagram bio, WhatsApp status, Facebook, anywhere."
    }
  ];

  const Logo = () => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center shadow-sm">
        <Store className="w-5 h-5 text-white" />
      </div>
      <span className="font-bold text-xl tracking-tight text-gray-900 font-heading">
        MyShopLink
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden selection:bg-[#25D366]/30 scroll-smooth">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={handleLogin} className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-tight">
              Login
            </button>
            <button 
              onClick={handleCTA} 
              className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-16">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-7xl font-heading font-black tracking-tight leading-[1.1] mb-6 text-gray-900"
          >
            Your catalogue link for<br className="hidden md:block" /> Instagram sellers.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Share one link. Customers browse your products and order directly on WhatsApp.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <button 
              onClick={handleCTA} 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#25D366] text-white font-black text-lg hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/30 transition-all active:scale-95"
            >
              Create My Store Free
            </button>
            <button 
              onClick={handleDemo} 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-bold text-lg hover:bg-gray-100 transition-all active:scale-95"
            >
              See an Example Store
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-4 text-sm font-bold text-gray-400"
          >
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#25D366]" /> FREE TO START</span>
            <span className="hidden sm:inline opacity-30">·</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#25D366]" /> NO APP NEEDED</span>
            <span className="hidden sm:inline opacity-30">·</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#25D366]" /> WORKS ON ANY PHONE</span>
          </motion.div>
        </section>

        {/* SOCIAL PROOF BAR */}
        <div className="bg-gray-50 border-y border-gray-100 py-10">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-center items-center gap-10 sm:gap-20 text-center">
            <div>
              <div className="text-3xl font-heading font-black text-gray-900 mb-1">500+</div>
              <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">sellers</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-200" />
            <div>
              <div className="text-3xl font-heading font-black text-gray-900 mb-1">10,000+</div>
              <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">products listed</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-200" />
            <div>
              <div className="text-3xl font-heading font-black text-[#25D366] mb-1">WhatsApp</div>
              <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">orders daily</div>
            </div>
          </div>
        </div>

        {/* PROBLEM SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-xs font-black tracking-[0.2em] text-[#25D366] uppercase mb-4 block">Sound familiar?</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900 max-w-3xl mx-auto">Sending photos on WhatsApp is costing you sales</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center hover:border-[#25D366]/30 transition-colors group">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">😩</div>
              <p className="text-lg font-bold text-gray-800 leading-snug">You answer the same 'price?' message 50 times a day</p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center hover:border-[#25D366]/30 transition-colors group">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">📸</div>
              <p className="text-lg font-bold text-gray-800 leading-snug">Blurry photos in a group chat look unprofessional</p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center hover:border-[#25D366]/30 transition-colors group">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">🤯</div>
              <p className="text-lg font-bold text-gray-800 leading-snug">You lose track of who ordered what and when</p>
            </div>
          </div>

          <p className="text-center text-lg md:text-xl font-bold text-gray-400 max-w-2xl mx-auto">
            There's a better way — and it takes 5 minutes to set up.
          </p>
        </section>

        {/* SOLUTION SECTION */}
        <section className="bg-[#f0fdf4] border-y border-[#dcfce7] py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-black tracking-[0.2em] text-[#25D366] uppercase mb-4 block">How MyShopLink works</span>
              <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900 max-w-4xl mx-auto">One link. All your products. Orders on WhatsApp.</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                { step: '1', title: 'Create your store', desc: 'Sign up free, add your store name and logo' },
                { step: '2', title: 'Add your products', desc: 'Photos, prices, descriptions — done in minutes' },
                { step: '3', title: 'Share your link', desc: 'Put it in your Instagram bio, WhatsApp status, anywhere' },
                { step: '4', title: 'Get orders', desc: 'Customers browse, tap Order, WhatsApp opens with pre-filled request' },
              ].map((s) => (
                <div key={s.step} className="relative group">
                  <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center font-black text-xl mb-6 shadow-lg shadow-[#25D366]/20 group-hover:scale-110 transition-transform">{s.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 font-semibold leading-relaxed text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-xs font-black tracking-[0.2em] text-[#25D366] uppercase mb-4 block">Everything you need</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900">Built for how Indian sellers actually work</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: <LinkIcon className="w-6 h-6 text-[#25D366]" />, title: 'One shareable link', desc: 'Works on Instagram bio, WhatsApp status, Facebook, anywhere' },
              { icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />, title: 'WhatsApp order button', desc: 'Every product has a button that opens WhatsApp with the order pre-filled. No typing needed.' },
              { icon: <Palette className="w-6 h-6 text-[#25D366]" />, title: 'Beautiful themes', desc: '6 themes that make your store look as professional as a big brand' },
              { icon: <BarChart3 className="w-6 h-6 text-[#25D366]" />, title: 'Sales dashboard', desc: 'Track views, clicks, orders and revenue in one place' },
              { icon: <CheckCircle2 className="w-6 h-6 text-[#25D366]" />, title: 'Order management', desc: 'Confirm or decline orders from your dashboard. No more lost chats.' },
              { icon: <ShoppingBag className="w-6 h-6 text-[#25D366]" />, title: 'Free to start', desc: 'List up to 10 products for free. Upgrade when you\'re ready.' },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white border border-gray-100 hover:border-[#25D366] hover:shadow-xl hover:shadow-[#25D366]/5 transition-all group">
                <div className="w-12 h-12 bg-[#f0fdf4] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#dcfce7] transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{f.title}</h3>
                <p className="text-gray-500 font-semibold leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="bg-gray-50 border-y border-gray-100 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-black tracking-[0.2em] text-[#25D366] uppercase mb-4 block">Real sellers. Real results.</span>
              <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900">They stopped sending photos. You should too.</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { 
                  text: "Before I was sending 20 photos in every WhatsApp group. Now I just share my MyShopLink and customers order directly. My sales doubled in the first month.", 
                  author: "Priya S.", 
                  detail: "Saree seller, Pune" 
                },
                { 
                  text: "I used to lose track of orders all the time. Now every order comes to my dashboard and I confirm it in one tap.", 
                  author: "Rahul M.", 
                  detail: "Handmade jewellery, Mumbai" 
                },
                { 
                  text: "My customers always asked price price price in DMs. Now they see everything on my store and message me ready to buy.", 
                  author: "Sneha K.", 
                  detail: "Home decor, Bangalore" 
                }
              ].map((t, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
                  <p className="text-2xl font-serif text-gray-800 italic leading-relaxed mb-10">"{t.text}"</p>
                  <div>
                    <div className="font-black text-gray-900 tracking-tight">{t.author}</div>
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">{t.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-xs font-black tracking-[0.2em] text-[#25D366] uppercase mb-4 block">Simple pricing</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900">Start free. Upgrade when you grow.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {/* FREE PLAN */}
            <div className="p-10 rounded-[2.5rem] bg-white border-2 border-gray-100 flex flex-col">
              <h3 className="text-[11px] font-black tracking-[0.2em] text-gray-400 uppercase mb-4">FREE PLAN</h3>
              <div className="text-5xl font-heading font-black text-gray-900 mb-10 flex items-baseline">
                ₹0<span className="text-sm font-bold text-gray-400 ml-1 tracking-normal">/month</span>
              </div>
              
              <ul className="space-y-4 mb-12 flex-1">
                {[
                  'Up to 10 products',
                  '1 store theme (Classic)',
                  'WhatsApp order button',
                  'Basic analytics',
                  'MyShopLink branding'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-[#25D366] shrink-0" /> {item}
                  </li>
                ))}
              </ul>

              <button 
                onClick={handleCTA} 
                className="w-full h-14 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 font-black text-lg hover:bg-gray-100 transition-all active:scale-95"
              >
                Start Free
              </button>
            </div>

            {/* PRO PLAN */}
            <div className="p-10 rounded-[2.5rem] bg-gray-900 border-2 border-gray-800 flex flex-col relative shadow-2xl shadow-gray-900/20 md:-translate-y-4 lg:-translate-y-6">
              <div className="absolute top-0 right-10 transform -translate-y-1/2 bg-[#25D366] text-white px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase">
                Most Popular
              </div>
              <h3 className="text-[11px] font-black tracking-[0.2em] text-[#25D366] uppercase mb-4">PRO PLAN</h3>
              <div className="text-5xl font-heading font-black text-white mb-10 flex items-baseline">
                ₹349<span className="text-sm font-bold text-gray-500 ml-1 tracking-normal">/month</span>
              </div>
              
              <ul className="space-y-4 mb-12 flex-1">
                {[
                  'Unlimited products',
                  'All 6 themes',
                  'No MyShopLink branding',
                  'Full analytics dashboard',
                  'Order management',
                  'Custom domain support',
                  'Priority support'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-[#25D366] shrink-0" /> {item}
                  </li>
                ))}
              </ul>

              <button 
                onClick={handleCTA} 
                className="w-full h-14 rounded-2xl bg-[#25D366] text-white font-black text-lg hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/20 transition-all active:scale-95"
              >
                Start Pro — ₹349/mo
              </button>
            </div>
          </div>

          <p className="text-center text-xs font-bold text-gray-400 mt-12 max-w-md mx-auto leading-relaxed">
            No credit card needed for free plan. Cancel Pro anytime. Payments via Razorpay.
          </p>
        </section>

        {/* FAQ SECTION */}
        <section className="bg-gray-50 border-y border-gray-100 py-24">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900 text-center mb-16">Questions? We've got answers.</h2>
            
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm transition-all">
                  <button 
                    onClick={() => toggleFaq(i)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-bold text-lg text-gray-900 pr-8">{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-transform duration-300 ${openFaq === i ? 'rotate-180 bg-gray-50' : ''}`}>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-8 pb-8 pt-0 text-gray-500 font-semibold leading-relaxed text-sm">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="bg-gray-950 py-28 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#25D366] opacity-[0.03] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#25D366] opacity-[0.03] blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight mb-8 text-white leading-[1.1]">Stop sending photos.<br />Start selling properly.</h2>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 font-semibold">Your first store is free. It takes 5 minutes.</p>
            <button 
              onClick={handleCTA} 
              className="px-12 py-5 rounded-2xl bg-[#25D366] text-white font-black text-xl hover:bg-[#20bd5a] shadow-2xl shadow-[#25D366]/20 transition-all active:scale-95 mb-8 w-full sm:w-auto"
            >
              Create My Free Store
            </button>
            <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">No credit card. No app. Just your link.</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
            
            <div className="flex flex-col items-start">
              <Logo />
              <p className="font-bold text-gray-400 mt-3 text-sm">The catalogue link for Indian sellers</p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4 text-xs font-black text-gray-400 uppercase tracking-widest">
              <Link href="#features" className="hover:text-[#25D366] transition-colors">Features</Link>
              <Link href="#pricing" className="hover:text-[#25D366] transition-colors">Pricing</Link>
              <button onClick={handleLogin} className="hover:text-[#25D366] transition-colors outline-none">Login</button>
              <button onClick={handleCTA} className="hover:text-[#25D366] transition-colors outline-none">Sign Up</button>
              <a href="#" className="hover:text-[#25D366] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#25D366] transition-colors">Terms</a>
            </div>

            <div className="text-[10px] font-black text-[#25D366] bg-[#f0fdf4] px-4 py-2 rounded-full border border-[#dcfce7] uppercase tracking-widest inline-flex items-center gap-2">
              Made for Indian sellers 🇮🇳
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-gray-50 text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">
            <div>© 2026 MyShopLink. All Rights Reserved.</div>
            <div>Built with ❤️ in India.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
