'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Store, ArrowRight, CheckCircle, Smartphone, Zap, BarChart3, Palette, Infinity, Play, Star } from 'lucide-react';
import { motion } from 'motion/react';

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ShopLink</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/signup')} className="text-gray-600 hover:text-gray-900 font-medium">Login</button>
            <button onClick={() => router.push('/signup')} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white" />
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          Turn WhatsApp Chats into Sales – <br className="hidden lg:block" />
          <span className="text-blue-600">Build Your Professional Store in Seconds</span>
        </motion.h1>
        <p className="text-xl lg:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Create stunning product showcases, share one link, and close sales directly in chats. No website builder, no complicated setup — just faster sales.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button onClick={() => router.push('/signup')} className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
            Start Free Now <ArrowRight className="w-5 h-5" />
          </button>
          <button className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> Watch 30-Second Demo
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-500 font-medium">
          <div className="flex text-yellow-400"><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /></div>
          <span>2,500+ creators & shops already selling more</span>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Sell Smarter, Not Harder</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Smartphone, title: "Lightning-Fast Setup", desc: "Beautiful store ready in under 30 seconds" },
              { icon: Zap, title: "One Shareable Link", desc: "Send your catalog via WhatsApp, Instagram, or anywhere" },
              { icon: Store, title: "Direct Chat Sales", desc: "Customers message you instantly – close deals in real time" },
              { icon: BarChart3, title: "Pro Looks, Zero Code", desc: "Premium themes & customization without designers" },
              { icon: Palette, title: "Live Analytics", desc: "Track views, clicks, and orders in one dashboard" },
              { icon: Infinity, title: "Scale Anytime", desc: "Free plan forever – upgrade when you grow" },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <feature.icon className="w-10 h-10 text-blue-600 mb-6" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">From Zero to First Sale in Minutes</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Sign up free", desc: "No credit card needed" },
              { step: "2", title: "Add products", desc: "Photos, prices, descriptions" },
              { step: "3", title: "Customize look", desc: "Themes, logo, banner" },
              { step: "4", title: "Share & Sell", desc: "Get WhatsApp orders rolling in" },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">{step.step}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <button onClick={() => router.push('/signup')} className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition">Ready? Start Free</button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Grow at Your Speed – Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {[
              { name: "Free", price: "$0", features: ["10 products", "Basic themes", "Core features"] },
              { name: "Pro Monthly", price: "$9", features: ["Unlimited products", "Premium themes", "No watermark", "Analytics export"], highlighted: false },
              { name: "Pro Yearly", price: "$90", priceSub: "/year", features: ["Everything in Pro", "Save 17%", "Best Value"], highlighted: true, tag: "Save 17%" },
            ].map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-2xl border ${plan.highlighted ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-gray-200'} shadow-sm bg-white`}>
                {plan.tag && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">{plan.tag}</div>}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg text-gray-500 font-normal">{plan.priceSub}</span></div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f, j) => <li key={j} className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-blue-600" /> {f}</li>)}
                </ul>
                <button onClick={() => router.push('/signup')} className={`w-full py-3 rounded-lg font-semibold ${plan.highlighted ? 'bg-blue-600 text-white' : 'bg-gray-900 text-white'}`}>Get Started</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Sellers Love the Speed & Simplicity</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "Went from messy photo DMs to professional sales in one afternoon", name: "Sarah J.", role: "Handmade Jewelry" },
              { quote: "My customers love how easy it is to order via WhatsApp link", name: "Mike T.", role: "Local Bakery" },
              { quote: "Finally a tool that actually understands how small businesses sell", name: "Elena R.", role: "Fashion Boutique" },
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex text-yellow-400 mb-4"><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /></div>
                <p className="text-gray-600 mb-6 italic">"{t.quote}"</p>
                <div className="font-bold">{t.name}</div>
                <div className="text-sm text-gray-500">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Stop Losing Sales to Scattered Messages</h2>
          <button onClick={() => router.push('/signup')} className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition mb-4">Build Your Store Free – Takes Seconds</button>
          <p className="text-blue-100">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 text-center text-gray-500">
        <div className="flex justify-center gap-6 mb-6">
          <a href="#" className="hover:text-blue-600">Features</a>
          <a href="#" className="hover:text-blue-600">Pricing</a>
          <a href="#" className="hover:text-blue-600">Login</a>
          <a href="#" className="hover:text-blue-600">Privacy</a>
        </div>
        <p>© 2026 ShopLink</p>
      </footer>
    </div>
  );
}
