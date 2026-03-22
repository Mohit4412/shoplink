'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Store, Link as LinkIcon, MessageCircle, Palette, BarChart3, CheckCircle2, Gift, ChevronDown } from 'lucide-react';

export function LandingPage() {
  const router = useRouter();

  const handleCTA = () => router.push('/signup');
  const handleLogin = () => router.push('/signup?mode=login');
  const handleDemo = () => router.push('/demo');

  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden selection:bg-[#25D366]/30">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              MyShopLink
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleLogin} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </button>
            <button onClick={handleCTA} className="px-5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              Start Free
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-16">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight leading-[1.1] mb-6 text-gray-900"
          >
            Your catalogue link for<br className="hidden md:block" /> Instagram sellers.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Share one link. Customers browse your products and order directly on WhatsApp.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <button onClick={handleCTA} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#25D366] text-white font-bold text-lg hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/20 transition-all duration-200">
              Create My Store Free
            </button>
            <button onClick={handleDemo} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-bold text-lg hover:bg-gray-100 transition-all duration-200">
              See an Example Store
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center items-center gap-4 text-sm font-medium text-gray-500"
          >
            <span className="flex items-center gap-1.5"><span className="text-[#25D366]">✓</span> Free to start</span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5"><span className="text-[#25D366]">✓</span> No app needed</span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5"><span className="text-[#25D366]">✓</span> Works on any phone</span>
          </motion.div>
        </section>

        {/* SOCIAL PROOF BAR */}
        <div className="bg-gray-50 border-y border-gray-100 py-8">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 text-center">
            <div>
              <div className="text-3xl font-heading font-black text-gray-900 mb-1">500+</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">sellers</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-200" />
            <div>
              <div className="text-3xl font-heading font-black text-gray-900 mb-1">10,000+</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">products listed</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-200" />
            <div>
              <div className="text-3xl font-heading font-black text-[#25D366] mb-1">WhatsApp</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">orders daily</div>
            </div>
          </div>
        </div>

        {/* PROBLEM SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-sm font-bold tracking-widest text-[#25D366] uppercase mb-3 block">Sound familiar?</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900">Sending photos on WhatsApp is costing you sales</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
              <div className="text-4xl mb-6">😩</div>
              <p className="text-lg font-medium text-gray-800 leading-snug">You answer the same 'price?' message 50 times a day</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
              <div className="text-4xl mb-6">📸</div>
              <p className="text-lg font-medium text-gray-800 leading-snug">Blurry photos in a group chat look unprofessional</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
              <div className="text-4xl mb-6">🤯</div>
              <p className="text-lg font-medium text-gray-800 leading-snug">You lose track of who ordered what and when</p>
            </div>
          </div>

          <p className="text-center text-lg md:text-xl font-medium text-gray-500 max-w-2xl mx-auto">
            There's a better way — and it takes 5 minutes to set up.
          </p>
        </section>

        {/* SOLUTION SECTION */}
        <section className="bg-[#25D366]/5 border-y border-[#25D366]/10 py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest text-[#25D366] uppercase mb-3 block">How MyShopLink works</span>
              <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900">One link. All your products. Orders on WhatsApp.</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Create your store', desc: 'Sign up free, add your store name and logo' },
                { step: '2', title: 'Add your products', desc: 'Photos, prices, descriptions — done in minutes' },
                { step: '3', title: 'Share your link', desc: 'Put it in your Instagram bio, WhatsApp status, anywhere' },
                { step: '4', title: 'Get orders', desc: 'Customers browse, tap Order, WhatsApp opens with their request pre-filled' },
              ].map((s) => (
                <div key={s.step} className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-[#25D366]/20">{s.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-sm font-bold tracking-widest text-[#25D366] uppercase mb-3 block">Everything you need</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900">Built for how Indian sellers actually work</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: <LinkIcon className="w-6 h-6 text-[#25D366]" />, title: 'One shareable link', desc: 'Works on Instagram bio, WhatsApp status, Facebook, anywhere' },
              { icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />, title: 'WhatsApp order button', desc: 'Every product has a button that opens WhatsApp with the order pre-filled. No typing needed.' },
              { icon: <Palette className="w-6 h-6 text-[#25D366]" />, title: 'Beautiful themes', desc: '6 themes that make your store look as professional as a big brand' },
              { icon: <BarChart3 className="w-6 h-6 text-[#25D366]" />, title: 'Sales dashboard', desc: 'Track views, clicks, orders and revenue in one place' },
              { icon: <CheckCircle2 className="w-6 h-6 text-[#25D366]" />, title: 'Order management', desc: 'Confirm or decline orders from your dashboard. No more lost chats.' },
              { icon: <Gift className="w-6 h-6 text-[#25D366]" />, title: 'Free to start', desc: 'List up to 10 products for free. Upgrade when you\'re ready.' },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-[#25D366] hover:shadow-lg hover:shadow-[#25D366]/5 transition-all">
                <div className="w-12 h-12 bg-[#25D366]/10 rounded-xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="bg-gray-50 border-y border-gray-100 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest text-[#25D366] uppercase mb-3 block">Real sellers. Real results.</span>
              <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900">They stopped sending photos. You should too.</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { text: "Before I was sending 20 photos in every WhatsApp group. Now I just share my MyShopLink and customers order directly. My sales doubled in the first month.", author: "Priya S.", detail: "Saree seller, Pune" },
                { text: "I used to lose track of orders all the time. Now every order comes to my dashboard and I confirm it in one tap.", author: "Rahul M.", detail: "Handmade jewellery, Mumbai" },
                { text: "My customers always asked price price price in DMs. Now they see everything on my store and message me ready to buy.", author: "Sneha K.", detail: "Home decor, Bangalore" }
              ].map((t, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
                  <p className="text-2xl md:text-3xl font-serif text-gray-800 italic leading-relaxed mb-8">"{t.text}"</p>
                  <div>
                    <div className="font-bold text-gray-900">{t.author}</div>
                    <div className="text-sm font-medium text-gray-500">{t.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-sm font-bold tracking-widest text-[#25D366] uppercase mb-3 block">Simple pricing</span>
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900">Start free. Upgrade when you grow.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {/* FREE PLAN */}
            <div className="p-8 md:p-10 rounded-3xl bg-white border border-gray-200 flex flex-col">
              <h3 className="text-2xl font-heading font-black text-gray-900 mb-2">FREE PLAN</h3>
              <div className="text-4xl font-heading font-black text-gray-900 mb-8">₹0<span className="text-lg text-gray-500 font-bold">/month</span></div>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 font-medium text-gray-700"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> Up to 10 products</li>
                <li className="flex items-center gap-3 font-medium text-gray-700"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> 1 store theme (Classic)</li>
                <li className="flex items-center gap-3 font-medium text-gray-700"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> WhatsApp order button</li>
                <li className="flex items-center gap-3 font-medium text-gray-700"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> Basic analytics</li>
                <li className="flex items-center gap-3 font-medium text-gray-700"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> MyShopLink branding</li>
              </ul>

              <button onClick={handleCTA} className="w-full py-4 rounded-xl bg-gray-100 text-gray-900 font-bold text-lg hover:bg-gray-200 transition-colors">
                Start Free
              </button>
            </div>

            {/* PRO PLAN */}
            <div className="p-8 md:p-10 rounded-3xl bg-gray-900 border border-gray-800 flex flex-col relative shadow-2xl shadow-gray-900/20 transform md:-translate-y-4">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-[#25D366] text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
                Most Popular
              </div>
              <h3 className="text-2xl font-heading font-black text-white mb-2">PRO PLAN</h3>
              <div className="text-4xl font-heading font-black text-white mb-8">₹349<span className="text-lg text-gray-400 font-bold">/month</span></div>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> Unlimited products</li>
                <li className="flex items-center gap-3 font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> All 6 themes</li>
                <li className="flex items-center gap-3 font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> No MyShopLink branding</li>
                <li className="flex items-center gap-3 font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> Full analytics dashboard</li>
                <li className="flex items-center gap-3 font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> Order management</li>
                <li className="flex items-center gap-3 font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> Custom domain support</li>
                <li className="flex items-center gap-3 font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#25D366]" /> Priority support</li>
              </ul>

              <button onClick={handleCTA} className="w-full py-4 rounded-xl bg-[#25D366] text-white font-bold text-lg hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/20 transition-colors">
                Start Pro — ₹349/mo
              </button>
            </div>
          </div>

          <p className="text-center text-sm font-medium text-gray-500 mt-10">
            No credit card needed for free plan. Cancel Pro anytime. Payments via Razorpay.
          </p>
        </section>

        {/* FAQ SECTION */}
        <section className="bg-gray-50 border-y border-gray-100 py-24">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-gray-900 text-center mb-16">Questions? We've got answers.</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors">
                  <button 
                    onClick={() => toggleFaq(i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-bold text-lg text-gray-900 pr-8">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-6 pt-2 text-gray-600 font-medium leading-relaxed">
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
        <section className="bg-gray-900 py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight mb-6 text-white">Stop sending photos.<br />Start selling properly.</h2>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 font-medium">Your first store is free. It takes 5 minutes.</p>
            <button onClick={handleCTA} className="px-10 py-5 rounded-xl bg-[#25D366] text-white font-black text-xl hover:bg-[#20bd5a] shadow-xl shadow-[#25D366]/20 transition-all duration-200 mb-6 w-full sm:w-auto">
              Create My Free Store
            </button>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No credit card. No app. Just your link.</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900">
                  MyShopLink
                </span>
              </div>
              <p className="font-medium text-gray-500">The catalogue link for Indian sellers</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-bold text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">Features</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Pricing</a>
              <button onClick={handleLogin} className="hover:text-gray-900 transition-colors uppercase outline-none">Login</button>
              <button onClick={handleCTA} className="hover:text-gray-900 transition-colors uppercase outline-none">Sign Up</button>
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            </div>

            <div className="text-sm font-bold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              Made for Indian sellers 🇮🇳
            </div>
          </div>

          <div className="text-center text-sm font-bold text-gray-400">
            © 2026 MyShopLink. Built with ❤️ in India.
          </div>
        </div>
      </footer>
    </div>
  );
}
