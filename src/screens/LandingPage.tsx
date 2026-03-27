'use client';

import { useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link as LinkIcon, MessageCircle, Palette, BarChart3,
  CheckCircle2, ChevronDown, ArrowRight,
  ShoppingBag, Star
} from 'lucide-react';
import Image from 'next/image';
import { AppLogo } from '../components/ui/AppLogo';

const EMERALD = '#059669';
const EMERALD_LIGHT = '#ecfdf5';
const CHARCOAL = '#1a1a1a';

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
      <nav className="fixed top-0 w-full z-50 border-b border-gray-100 bg-white/88 backdrop-blur-md">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-3.5 sm:h-14 sm:px-5">
          <AppLogo size="sm" className="sm:[&>span]:text-xl" />
          <div className="hidden sm:flex items-center gap-5 text-[13px] font-semibold text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <Link href="/support" className="hover:text-gray-900 transition-colors">Contact</Link>
            <a href="#" rel="nofollow" className="hover:text-gray-900 transition-colors">About</a>
            <a href="#" rel="nofollow" className="hover:text-gray-900 transition-colors">Tools</a>
            <a href="#" rel="nofollow" className="hover:text-gray-900 transition-colors">Blog</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={handleLogin}
              className="rounded-md px-2 py-1 text-[12px] font-semibold text-gray-600 transition-colors hover:text-gray-900 sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-[13px]"
            >
              Log in
            </button>
            <button
              onClick={handleCTA}
              className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-all active:scale-95 sm:rounded-lg sm:px-3.5 sm:py-2 sm:text-[13px]"
              style={{ background: CHARCOAL }}
            >
              Start free
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-12 sm:pt-14">

        {/* ── HERO ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-5 pt-12 sm:pt-16 pb-16 sm:pb-20 md:pt-24 md:pb-28">
          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">

            {/* left copy */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex-1 min-w-0 lg:min-w-[480px] text-center lg:text-left"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-4 sm:mb-6" 
                style={{ borderColor: `${EMERALD}40`, color: EMERALD, background: EMERALD_LIGHT }}
              >
                <Star className="w-3 h-3 fill-current" /> Free to start · No credit card
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight leading-[1.08] mb-4 sm:mb-6 text-gray-900"
              >
                Your catalogue link<br />for Instagram sellers.
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-base sm:text-lg text-gray-500 max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed font-medium px-2 sm:px-0"
              >
                Share one link. Customers browse your products and order directly on WhatsApp — no app, no website, no hassle.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6 sm:mb-8 px-2 sm:px-0"
              >
                <button onClick={handleCTA} className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl text-white font-black text-sm sm:text-base transition-all active:scale-95 shadow-lg hover:shadow-xl" style={{ background: CHARCOAL }}>
                  Create my free store
                </button>
                <button onClick={handleDemo} className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all active:scale-95">
                  See example store <ArrowRight className="inline w-4 h-4 ml-1" />
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-5 text-xs font-bold text-gray-400 px-2 sm:px-0"
              >
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: EMERALD }} /> Free plan available</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: EMERALD }} /> Works on any phone</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: EMERALD }} /> Live in 5 minutes</span>
              </motion.div>
            </motion.div>

            {/* right phone */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
              className="hidden lg:block shrink-0 lg:w-[420px]"
            >
              <PhoneMockup />
            </motion.div>
          </div>
        </section>

        {/* ── VALUE PROPS BAR ── */}
        <div className="border-y border-gray-100 py-8" style={{ background: EMERALD_LIGHT }}>
          <div className="max-w-4xl mx-auto px-5 flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 text-center">
            {[
              { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Free forever plan' },
              { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Live in 5 minutes' },
              { icon: <CheckCircle2 className="w-5 h-5" />, label: 'No credit card needed' },
            ].map((s, i) => (
              <Fragment key={s.label}>
                {i > 0 && <div className="hidden sm:block w-px h-10 bg-emerald-200" />}
                <div className="flex items-center gap-2.5">
                  <div style={{ color: EMERALD }}>{s.icon}</div>
                  <div className="text-sm font-bold text-gray-700">{s.label}</div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* ── PROBLEM ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-5 py-16 sm:py-20 md:py-28">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12"
          >
            <span className="text-xs font-black tracking-[0.2em] uppercase mb-3 block" style={{ color: EMERALD }}>Sound familiar?</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900 max-w-2xl mx-auto px-4">Sending photos on WhatsApp is costing you sales</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto">
            {[
              { emoji: '😩', text: 'You answer the same "price?" message 50 times a day' },
              { emoji: '📸', text: 'Blurry photos in a group chat look unprofessional' },
              { emoji: '🤯', text: 'You lose track of who ordered what and when' },
            ].map((p, i) => (
              <motion.div 
                key={p.emoji}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center hover:border-gray-200 hover:shadow-md transition-all"
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{p.emoji}</div>
                <p className="text-sm sm:text-base font-bold text-gray-800 leading-snug">{p.text}</p>
              </motion.div>
            ))}
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center text-sm sm:text-base font-bold text-gray-400 max-w-xl mx-auto mt-8 sm:mt-10 px-4"
          >
            There's a better way — and it takes 5 minutes to set up.
          </motion.p>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="border-y border-gray-100 py-16 sm:py-20 md:py-28" style={{ background: EMERALD_LIGHT }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-5">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 sm:mb-14"
            >
              <span className="text-xs font-black tracking-[0.2em] uppercase mb-3 block" style={{ color: EMERALD }}>How it works</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900 px-4">One link. All your products. Orders on WhatsApp.</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto">
              {[
                { step: '1', title: 'Create your store', desc: 'Sign up free, add your store name and logo' },
                { step: '2', title: 'Add your products', desc: 'Photos, prices, descriptions — done in minutes' },
                { step: '3', title: 'Share your link', desc: 'Put it in your Instagram bio, WhatsApp status, anywhere' },
                { step: '4', title: 'Get orders', desc: 'Customers browse, tap Order, WhatsApp opens with pre-filled request' },
              ].map((s, i) => (
                <motion.div 
                  key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex flex-col p-5 sm:p-0"
                >
                  <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-lg mb-4 shadow-md" style={{ background: EMERALD }}>{s.step}</div>
                  <h3 className="text-base font-black text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-5 py-16 sm:py-20 md:py-28">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="text-xs font-black tracking-[0.2em] uppercase mb-3 block" style={{ color: EMERALD }}>Everything you need</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900 px-4">Built for how Indian sellers actually work</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {[
              { icon: <LinkIcon className="w-5 h-5" />, title: 'One shareable link', desc: 'Works on Instagram bio, WhatsApp status, Facebook, anywhere' },
              { icon: <MessageCircle className="w-5 h-5" />, title: 'WhatsApp order button', desc: 'Every product opens WhatsApp with the order pre-filled. No typing needed.' },
              { icon: <Palette className="w-5 h-5" />, title: 'Beautiful themes', desc: '6 themes that make your store look as professional as a big brand' },
              { icon: <BarChart3 className="w-5 h-5" />, title: 'Sales dashboard', desc: 'Track views, clicks, orders and revenue in one place' },
              { icon: <CheckCircle2 className="w-5 h-5" />, title: 'Order management', desc: 'Confirm or decline orders from your dashboard. No more lost chats.' },
              { icon: <ShoppingBag className="w-5 h-5" />, title: 'Free to start', desc: 'List up to 10 products for free. Upgrade when you\'re ready.' },
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ background: EMERALD_LIGHT, color: EMERALD }}>
                  {f.icon}
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="bg-gray-50 border-y border-gray-100 py-16 sm:py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-5">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 sm:mb-14"
            >
              <span className="text-xs font-black tracking-[0.2em] uppercase mb-3 block" style={{ color: EMERALD }}>Real sellers. Real results.</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900 px-4">They stopped sending photos. You should too.</h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
              {[
                { text: "Before I was sending 20 photos in every WhatsApp group. Now I just share my MyShopLink and customers order directly. My sales doubled in the first month.", author: "Priya S.", detail: "Saree seller, Pune" },
                { text: "I used to lose track of orders all the time. Now every order comes to my dashboard and I confirm it in one tap.", author: "Rahul M.", detail: "Handmade jewellery, Mumbai" },
                { text: "My customers always asked price price price in DMs. Now they see everything on my store and message me ready to buy.", author: "Sneha K.", detail: "Home decor, Bangalore" },
              ].map((t, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: EMERALD }} />)}
                  </div>
                  <p className="text-sm sm:text-base font-serif text-gray-700 italic leading-relaxed mb-6">"{t.text}"</p>
                  <div>
                    <div className="text-sm font-black text-gray-900">{t.author}</div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-5 py-16 sm:py-20 md:py-28">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="text-xs font-black tracking-[0.2em] uppercase mb-3 block" style={{ color: EMERALD }}>Simple pricing</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900 px-4">Start free. Upgrade when you grow.</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6 max-w-3xl mx-auto">
            {/* FREE */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-gray-100 flex flex-col"
            >
              <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-3">Free plan</p>
              <div className="text-3xl sm:text-4xl font-heading font-black text-gray-900 mb-6 sm:mb-8 flex items-baseline">
                ₹0<span className="text-sm font-bold text-gray-400 ml-1">/month</span>
              </div>
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                {['Up to 10 products', '1 store theme', 'WhatsApp order button', 'Basic analytics', 'MyShopLink branding'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-gray-600">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: EMERALD }} /> {item}
                  </li>
                ))}
              </ul>
              <button onClick={handleCTA} className="w-full h-11 sm:h-12 rounded-xl bg-gray-100 text-gray-900 font-black text-sm hover:bg-gray-200 transition-all active:scale-95">
                Start free
              </button>
            </motion.div>

            {/* PRO */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="p-6 sm:p-8 rounded-2xl flex flex-col relative shadow-xl md:-translate-y-3" 
              style={{ background: CHARCOAL }}
            >
              <div className="absolute -top-3 right-6 sm:right-8 px-3 sm:px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase text-white" style={{ background: EMERALD }}>
                Most popular
              </div>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-3" style={{ color: EMERALD }}>Pro plan</p>
              <div className="text-3xl sm:text-4xl font-heading font-black text-white mb-6 sm:mb-8 flex items-baseline">
                ₹349<span className="text-sm font-bold text-gray-500 ml-1">/month</span>
              </div>
              <div className="mb-5 sm:mb-6 inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ background: 'rgba(5, 150, 105, 0.14)', color: '#a7f3d0' }}>
                14-day free trial included
              </div>
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                {['Unlimited products', 'All 6 themes', 'No MyShopLink branding', 'Full analytics dashboard', 'Order management', 'Custom domain support', 'Priority support'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-gray-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: EMERALD }} /> {item}
                  </li>
                ))}
              </ul>
              <button onClick={handleCTA} className="w-full h-11 sm:h-12 rounded-xl text-white font-black text-sm transition-all active:scale-95 shadow-lg" style={{ background: EMERALD }}>
                Start Pro — ₹349/mo
              </button>
            </motion.div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center text-xs font-semibold text-gray-400 mt-6 sm:mt-8 px-4"
          >
            Every signup gets a 14-day Pro trial · Cancel anytime · Payments via Razorpay
          </motion.p>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-gray-50 border-y border-gray-100 py-16 sm:py-20 md:py-28">
          <div className="max-w-2xl mx-auto px-4 sm:px-5">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight text-gray-900 text-center mb-8 sm:mb-12 px-4"
            >
              Questions? We've got answers.
            </motion.h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
                >
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left focus:outline-none">
                    <span className="font-bold text-sm sm:text-base text-gray-900 pr-4 sm:pr-6">{faq.q}</span>
                    <div className={`w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180 bg-gray-50' : ''}`}>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
                        <div className="px-5 sm:px-6 pb-4 sm:pb-5 text-sm sm:text-base text-gray-500 font-medium leading-relaxed">{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 sm:py-24 md:py-32 relative overflow-hidden" style={{ background: CHARCOAL }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-10" style={{ background: EMERALD }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[120px] opacity-10" style={{ background: EMERALD }} />
          <div className="max-w-3xl mx-auto px-4 sm:px-5 text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight mb-4 sm:mb-5 text-white leading-[1.1] px-4"
            >
              Stop sending photos.<br />Start selling properly.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-base sm:text-lg text-gray-400 mb-8 sm:mb-10 font-medium px-4"
            >
              Your first store is free. It takes 5 minutes.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.3, duration: 0.5 }}
              onClick={handleCTA} 
              className="px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-white font-black text-base sm:text-lg transition-all active:scale-95 shadow-xl w-full sm:w-auto" 
              style={{ background: EMERALD }}
            >
              Create my free store
            </motion.button>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xs font-bold text-gray-600 uppercase tracking-[0.25em] mt-5 sm:mt-6 px-4"
            >
              No credit card · No app · Just your link
            </motion.p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white py-14 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-10">
            <div>
              <AppLogo size="lg" />
              <p className="text-sm font-medium text-gray-400 mt-2">The catalogue link for Indian sellers</p>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
              <button onClick={handleLogin} className="hover:text-gray-900 transition-colors">Login</button>
              <button onClick={handleCTA} className="hover:text-gray-900 transition-colors">Sign up</button>
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
              <Link href="/refund-policy" className="hover:text-gray-900 transition-colors">Refunds</Link>
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
