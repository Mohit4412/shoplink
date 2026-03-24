'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store, Link as LinkIcon, MessageCircle, Palette, BarChart3,
  CheckCircle2, ChevronDown, ArrowRight,
  ShoppingBag, Star
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const EMERALD = '#059669';
const EMERALD_HOVER = '#047857';
const EMERALD_LIGHT = '#ecfdf5';
const CHARCOAL = '#1a1a1a';

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ background: EMERALD }}>
        <Store className="w-5 h-5 text-white" />
      </div>
      <span className="font-bold text-xl tracking-tight text-gray-900 font-heading">MyShopLink</span>
    </div>
  );
}

/* ── Hero phone image ── */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[220px] sm:w-[300px] lg:w-[400px] drop-shadow-2xl">
      <Image
        src="/hero-phone.png"
        alt="MyShopLink store on mobile"
        width={340}
        height={680}
        className="w-full h-auto object-contain"
        priority
      />
    </div>
  );
}

export function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCTA = () => router.push('/signup');
  const handleLogin = () => router.push('/signup?mode=login');
  const handleDemo = () => router.push('/demo');

  const faqs = [
    { q: "Do my customers need to download an app?", a: "No. They just click your link and browse in their browser — no app, no signup, no friction." },
    { q: "How does WhatsApp ordering work?", a: "Every product has an 'Order via WhatsApp' button. When tapped, WhatsApp opens with a pre-filled message including the product name and price. They just hit send." },
    { q: "Do I need technical knowledge?", a: "None at all. If you can use Instagram, you can use MyShopLink. Your store is live in under 5 minutes." },
    { q: "Can I use my own domain name?", a: "Yes — custom domain is a Pro feature. Your store can be at yourname.com instead of yourname.myshoplink.site." },
    { q: "Is my store link safe to share on Instagram?", a: "Completely. It's a regular website URL — safe to put in your Instagram bio, WhatsApp status, Facebook, anywhere." },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden scroll-smooth">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 h-16 flex items-center">
        <div className="max-w-6xl mx-auto px-5 w-full flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <div className="hidden sm:flex items-center gap-8 text-sm font-semibold text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogin} className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Log in</button>
            <button onClick={handleCTA} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-sm active:scale-95" style={{ background: CHARCOAL }}>
              Start free
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">

        {/* ── HERO ── */}
        <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* left copy */}
            <div className="flex-1 min-w-0 lg:min-w-[480px] text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-6" style={{ borderColor: `${EMERALD}40`, color: EMERALD, background: EMERALD_LIGHT }}>
                <Star className="w-3 h-3 fill-current" /> Free to start · No credit card
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight leading-[1.08] mb-6 text-gray-900">
                Your catalogue link<br />for Instagram sellers.
              </h1>

              <p className="text-lg text-gray-500 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed font-medium">
                Share one link. Customers browse your products and order directly on WhatsApp — no app, no website, no hassle.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <button onClick={handleCTA} className="px-7 py-3.5 rounded-xl text-white font-black text-base transition-all active:scale-95 shadow-lg" style={{ background: CHARCOAL }}>
                  Create my free store
                </button>
                <button onClick={handleDemo} className="px-7 py-3.5 rounded-xl font-bold text-base border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all active:scale-95">
                  See example store <ArrowRight className="inline w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-5 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: EMERALD }} /> Free plan available</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: EMERALD }} /> Works on any phone</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: EMERALD }} /> Live in 5 minutes</span>
              </div>
            </div>

            {/* right phone */}
            <div className="shrink-0 lg:w-[420px]">
              <PhoneMockup />
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF BAR ── */}
        <div className="border-y border-gray-100 py-8" style={{ background: EMERALD_LIGHT }}>
          <div className="max-w-4xl mx-auto px-5 flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 text-center">
            {[
              { num: '500+', label: 'Active sellers' },
              { num: '10,000+', label: 'Products listed' },
              { num: '₹0', label: 'To get started' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="hidden sm:block w-px h-10 bg-emerald-200" />}
                <div>
                  <div className="text-2xl font-heading font-black mb-0.5" style={{ color: CHARCOAL }}>{s.num}</div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── PROBLEM ── */}
        <section className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="text-center mb-12">
            <span className="text-xs font-black tracking-[0.2em] uppercase mb-3 block" style={{ color: EMERALD }}>Sound familiar?</span>
            <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900 max-w-2xl mx-auto">Sending photos on WhatsApp is costing you sales</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { emoji: '😩', text: 'You answer the same "price?" message 50 times a day' },
              { emoji: '📸', text: 'Blurry photos in a group chat look unprofessional' },
              { emoji: '🤯', text: 'You lose track of who ordered what and when' },
            ].map((p) => (
              <div key={p.emoji} className="p-7 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center hover:border-gray-200 hover:shadow-md transition-all">
                <div className="text-4xl mb-4">{p.emoji}</div>
                <p className="text-base font-bold text-gray-800 leading-snug">{p.text}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-base font-bold text-gray-400 max-w-xl mx-auto mt-10">
            There's a better way — and it takes 5 minutes to set up.
          </p>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="border-y border-gray-100 py-20 md:py-28" style={{ background: EMERALD_LIGHT }}>
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-14">
              <span className="text-xs font-black tracking-[0.2em] uppercase mb-3 block" style={{ color: EMERALD }}>How it works</span>
              <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900">One link. All your products. Orders on WhatsApp.</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { step: '1', title: 'Create your store', desc: 'Sign up free, add your store name and logo' },
                { step: '2', title: 'Add your products', desc: 'Photos, prices, descriptions — done in minutes' },
                { step: '3', title: 'Share your link', desc: 'Put it in your Instagram bio, WhatsApp status, anywhere' },
                { step: '4', title: 'Get orders', desc: 'Customers browse, tap Order, WhatsApp opens with pre-filled request' },
              ].map((s) => (
                <div key={s.step} className="flex flex-col">
                  <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-lg mb-4 shadow-md" style={{ background: EMERALD }}>{s.step}</div>
                  <h3 className="text-base font-black text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="text-center mb-14">
            <span className="text-xs font-black tracking-[0.2em] uppercase mb-3 block" style={{ color: EMERALD }}>Everything you need</span>
            <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900">Built for how Indian sellers actually work</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: <LinkIcon className="w-5 h-5" />, title: 'One shareable link', desc: 'Works on Instagram bio, WhatsApp status, Facebook, anywhere' },
              { icon: <MessageCircle className="w-5 h-5" />, title: 'WhatsApp order button', desc: 'Every product opens WhatsApp with the order pre-filled. No typing needed.' },
              { icon: <Palette className="w-5 h-5" />, title: 'Beautiful themes', desc: '6 themes that make your store look as professional as a big brand' },
              { icon: <BarChart3 className="w-5 h-5" />, title: 'Sales dashboard', desc: 'Track views, clicks, orders and revenue in one place' },
              { icon: <CheckCircle2 className="w-5 h-5" />, title: 'Order management', desc: 'Confirm or decline orders from your dashboard. No more lost chats.' },
              { icon: <ShoppingBag className="w-5 h-5" />, title: 'Free to start', desc: 'List up to 10 products for free. Upgrade when you\'re ready.' },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ background: EMERALD_LIGHT, color: EMERALD }}>
                  {f.icon}
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="bg-gray-50 border-y border-gray-100 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-14">
              <span className="text-xs font-black tracking-[0.2em] uppercase mb-3 block" style={{ color: EMERALD }}>Real sellers. Real results.</span>
              <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900">They stopped sending photos. You should too.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { text: "Before I was sending 20 photos in every WhatsApp group. Now I just share my MyShopLink and customers order directly. My sales doubled in the first month.", author: "Priya S.", detail: "Saree seller, Pune" },
                { text: "I used to lose track of orders all the time. Now every order comes to my dashboard and I confirm it in one tap.", author: "Rahul M.", detail: "Handmade jewellery, Mumbai" },
                { text: "My customers always asked price price price in DMs. Now they see everything on my store and message me ready to buy.", author: "Sneha K.", detail: "Home decor, Bangalore" },
              ].map((t, i) => (
                <div key={i} className="p-7 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: EMERALD }} />)}
                  </div>
                  <p className="text-base font-serif text-gray-700 italic leading-relaxed mb-6">"{t.text}"</p>
                  <div>
                    <div className="text-sm font-black text-gray-900">{t.author}</div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="text-center mb-14">
            <span className="text-xs font-black tracking-[0.2em] uppercase mb-3 block" style={{ color: EMERALD }}>Simple pricing</span>
            <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900">Start free. Upgrade when you grow.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* FREE */}
            <div className="p-8 rounded-2xl bg-white border-2 border-gray-100 flex flex-col">
              <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-3">Free plan</p>
              <div className="text-4xl font-heading font-black text-gray-900 mb-8 flex items-baseline">
                ₹0<span className="text-sm font-bold text-gray-400 ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Up to 10 products', '1 store theme', 'WhatsApp order button', 'Basic analytics', 'MyShopLink branding'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-gray-600">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: EMERALD }} /> {item}
                  </li>
                ))}
              </ul>
              <button onClick={handleCTA} className="w-full h-12 rounded-xl bg-gray-100 text-gray-900 font-black text-sm hover:bg-gray-200 transition-all active:scale-95">
                Start free
              </button>
            </div>

            {/* PRO */}
            <div className="p-8 rounded-2xl flex flex-col relative shadow-xl md:-translate-y-3" style={{ background: CHARCOAL }}>
              <div className="absolute -top-3 right-8 px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase text-white" style={{ background: EMERALD }}>
                Most popular
              </div>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-3" style={{ color: EMERALD }}>Pro plan</p>
              <div className="text-4xl font-heading font-black text-white mb-8 flex items-baseline">
                ₹349<span className="text-sm font-bold text-gray-500 ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Unlimited products', 'All 6 themes', 'No MyShopLink branding', 'Full analytics dashboard', 'Order management', 'Custom domain support', 'Priority support'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-gray-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: EMERALD }} /> {item}
                  </li>
                ))}
              </ul>
              <button onClick={handleCTA} className="w-full h-12 rounded-xl text-white font-black text-sm transition-all active:scale-95 shadow-lg" style={{ background: EMERALD }}>
                Start Pro — ₹349/mo
              </button>
            </div>
          </div>

          <p className="text-center text-xs font-semibold text-gray-400 mt-8">
            No credit card needed for free plan · Cancel Pro anytime · Payments via Razorpay
          </p>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-gray-50 border-y border-gray-100 py-20 md:py-28">
          <div className="max-w-2xl mx-auto px-5">
            <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900 text-center mb-12">Questions? We've got answers.</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none">
                    <span className="font-bold text-sm text-gray-900 pr-6">{faq.q}</span>
                    <div className={`w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180 bg-gray-50' : ''}`}>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
                        <div className="px-6 pb-5 text-sm text-gray-500 font-medium leading-relaxed">{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: CHARCOAL }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-10" style={{ background: EMERALD }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[120px] opacity-10" style={{ background: EMERALD }} />
          <div className="max-w-3xl mx-auto px-5 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-5 text-white leading-[1.1]">
              Stop sending photos.<br />Start selling properly.
            </h2>
            <p className="text-lg text-gray-400 mb-10 font-medium">Your first store is free. It takes 5 minutes.</p>
            <button onClick={handleCTA} className="px-10 py-4 rounded-xl text-white font-black text-lg transition-all active:scale-95 shadow-xl w-full sm:w-auto" style={{ background: EMERALD }}>
              Create my free store
            </button>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.25em] mt-6">No credit card · No app · Just your link</p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white py-14 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-10">
            <div>
              <Logo />
              <p className="text-sm font-medium text-gray-400 mt-2">The catalogue link for Indian sellers</p>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
              <button onClick={handleLogin} className="hover:text-gray-900 transition-colors">Login</button>
              <button onClick={handleCTA} className="hover:text-gray-900 transition-colors">Sign up</button>
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ color: EMERALD, borderColor: `${EMERALD}30`, background: EMERALD_LIGHT }}>
              Made for Indian sellers 🇮🇳
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-50 text-[11px] font-bold text-gray-300 uppercase tracking-[0.2em]">
            <div>© 2026 MyShopLink. All Rights Reserved.</div>
            <div>Built with ❤️ in India.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
