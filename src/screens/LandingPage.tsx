'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { MessageCircle, Instagram, ArrowRight, Target, Link as LinkIcon, Store } from 'lucide-react';

export function LandingPage() {
  const router = useRouter();

  const handleCTA = () => router.push('/signup');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
      {/* Background accents matching Dashboard */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-[#F8F9FA]" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              ShopLink
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleCTA} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </button>
            <button onClick={handleCTA} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              Start for free
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-28 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-sm font-medium text-blue-700 mb-8"
          >
            <Instagram className="w-4 h-4" />
            <span>Built exclusively for Instagram Sellers</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-8 text-gray-900"
          >
            Never lose a sale <br />
            <span className="text-blue-600">
              in your DMs again.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Turn Instagram traffic into instant WhatsApp orders. Automatically capture phone numbers and close more sales with a beautiful link-in-bio store.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button onClick={handleCTA} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 shadow-md transition-all duration-200 flex items-center justify-center gap-2">
              Claim Your Link Now <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </section>

        {/* The Problem vs Solution Showcase */}
        <section className="max-w-7xl mx-auto px-6 py-24 mt-10">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* The Old Way */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 md:p-10 rounded-3xl bg-white border border-gray-200 shadow-sm"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                The Old Way 📉
              </h3>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold border border-gray-200">1</div>
                  <div>
                    <h4 className="text-gray-900 font-bold mb-1">Customer sees your reel</h4>
                    <p className="text-gray-600">They DM you asking "Price please?"</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold border border-gray-200">2</div>
                  <div>
                    <h4 className="text-gray-900 font-bold mb-1">You are busy / sleeping</h4>
                    <p className="text-gray-600">Hours go by. The impulse to buy fades.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-semibold border border-red-100">3</div>
                  <div>
                    <h4 className="text-red-700 font-bold mb-1">Sale Lost Forever</h4>
                    <p className="text-gray-600">They buy from a competitor. You have no way to reach them.</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* The Solution */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 shadow-sm relative overflow-hidden"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                The ShopLink Way 🚀
              </h3>
              <ul className="space-y-8 relative z-10">
                <li className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center text-blue-600 font-semibold border border-blue-200 shadow-sm">1</div>
                  <div>
                    <h4 className="text-gray-900 font-bold mb-1">Customer clicks your bio link</h4>
                    <p className="text-gray-600">They browse a beautiful catalog of your products.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center text-blue-600 font-semibold border border-blue-200 shadow-sm">2</div>
                  <div>
                    <h4 className="text-gray-900 font-bold mb-1">Clicks "Order on WhatsApp"</h4>
                    <p className="text-gray-600">A pre-filled message opens directly in their WhatsApp.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold border border-green-200 shadow-sm">3</div>
                  <div>
                    <h4 className="text-green-800 font-bold mb-1">You Capture the Lead</h4>
                    <p className="text-gray-700">Even if you reply later, <strong className="text-gray-900">you now have their phone number.</strong> Follow up and close the sale.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Value Prop Features */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">Built to convert scrollers into buyers.</h2>
            <p className="text-gray-600 text-lg">Everything you need to capture demand instantly.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                 <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Link-in-Bio Ready</h3>
              <p className="text-gray-600 leading-relaxed">A clean, 2-page optimized website that loads instantly and showrooms your best products.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                 <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Frictionless Orders</h3>
              <p className="text-gray-600 leading-relaxed">No confusing cart checkouts. Buyers tap a button and land in your WhatsApp inbox ready to pay.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                 <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lead Ownership</h3>
              <p className="text-gray-600 leading-relaxed">Instagram owns your followers. With WhatsApp routing, you own their phone numbers for lifetime retargeting.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-6 py-20 mt-10">
          <div className="bg-blue-600 rounded-3xl p-12 text-center shadow-xl relative overflow-hidden">
             {/* Subtle internal decoration */}
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50" />
             <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-700 rounded-full blur-3xl opacity-50" />
             
             <div className="relative z-10">
               <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white leading-tight">Stop leaking potential revenue.</h2>
               <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">Set up your store in 30 seconds. Put the link in your bio. Watch the WhatsApp inquiries flow in.</p>
               <button onClick={handleCTA} className="px-8 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg">
                 Create Your Free Store
               </button>
             </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-10 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
          <p>© 2026 ShopLink. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
