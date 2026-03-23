'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Store, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '../context/StoreContext';
import { countryCodes } from '../utils/countryCodes';
import { SignupSuccess } from '../components/auth/SignupSuccess';

export function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hydrated, login, user } = useStore();

  const [isLoginMode, setIsLoginMode] = useState(searchParams?.get('mode') === 'login');
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes.find(c => c.code === 'IN') || countryCodes[0]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  // Username availability check
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameCheckMsg, setUsernameCheckMsg] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (hydrated && user && !isSignupSuccess) {
      router.replace('/dashboard');
    }
  }, [hydrated, router, user, isSignupSuccess]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setUsername(val);
    setUsernameAvailable(null);
    setUsernameCheckMsg('');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.length < 3) return;

    setCheckingUsername(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(val)}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
        setUsernameCheckMsg(data.available ? `${val}.myshoplink.site is available` : (data.reason || 'Username not available'));
      } catch {
        setUsernameAvailable(null);
        setUsernameCheckMsg('');
      } finally {
        setCheckingUsername(false);
      }
    }, 500);
  };

  const getErrors = () => {
    const errors: Record<string, string> = {};
    
    if (!isLoginMode) {
      if (!fullName.trim()) errors.fullName = 'Please enter your name';
      if (!username) {
        errors.username = 'Store URL is required';
      } else if (username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      }
      
      const digits = whatsapp.replace(/\D/g, '');
      if (!digits) {
        errors.whatsapp = 'Phone number is required';
      } else if (selectedCountry.code === 'IN' && digits.length !== 10) {
        errors.whatsapp = 'Enter a valid 10-digit WhatsApp number';
      } else if (digits.length < 7 || digits.length > 15) {
        errors.whatsapp = 'Enter a valid WhatsApp number';
      }
      
      if (!agreeTerms) errors.terms = 'You must agree to the Terms of Service';
    }

    if (!email) errors.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address';

    if (!password) {
      errors.password = 'Password is required';
    } else if (!isLoginMode && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setAuthError('');

    const errors = getErrors();
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    const digits = whatsapp.replace(/\D/g, '');
    const fullWhatsapp = isLoginMode ? whatsapp : `${selectedCountry.dialCode}${digits}`;
    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup';

    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username: username || email.split('@')[0],
          firstName: firstName || '',
          lastName: lastName || '',
          whatsappNumber: fullWhatsapp,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(data?.error || 'Unable to continue right now.');
        setIsLoading(false);
        return;
      }

      login(data.user);
      
      if (isLoginMode) {
        router.push('/dashboard');
      } else {
        setIsSignupSuccess(true);
        setIsLoading(false);
      }
    } catch (error) {
      setAuthError('Unable to connect right now. Please try again.');
      setIsLoading(false);
    }
  };

  const errors = hasSubmitted ? getErrors() : {};

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-12 px-4 font-sans text-gray-900 selection:bg-[#25D366]/30">
      
      {/* Top Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 mt-4 hover:opacity-90 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center shadow-sm">
          <Store className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-gray-900">
          MyShopLink
        </span>
      </Link>

      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] p-6 md:p-10">
        
        {/* SUCCESS MODE */}
        {isSignupSuccess ? (
          <SignupSuccess 
            firstName={fullName.split(' ')[0]} 
            username={username} 
            email={email} 
          />
        ) : isLoginMode ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back</h1>
              <p className="text-sm font-medium text-gray-500 mt-2">Log in to manage your store</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full h-11 px-3 rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#25D366]'} focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full h-11 pl-3 pr-10 rounded-lg border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#25D366]'} focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              {authError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{authError}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-[52px] mt-2 rounded-xl bg-[#25D366] text-white font-semibold text-lg hover:bg-[#20bd5a] flex items-center justify-center gap-2 transition-all disabled:opacity-80 shadow-lg shadow-[#25D366]/20"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? "Logging in..." : "Log in to my store"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="#" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors inline-block mb-6">Forgot your password?</a>
              <div className="border-t border-gray-100 pt-6">
                <button 
                  onClick={() => { setIsLoginMode(false); setHasSubmitted(false); setAuthError(''); }}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Don't have a store yet? Sign up free
                </button>
              </div>
            </div>
          </>

        ) : (
          
          /* SIGNUP MODE */
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create your free store</h1>
              <p className="text-sm font-medium text-gray-500 mt-2">Set up in 5 minutes. No credit card needed.</p>
            </div>

            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 mb-8 text-center">
              <p className="text-sm font-bold text-[#15803d]">🎉 Free plan — Up to 10 products. Upgrade to Pro at any time.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Your name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full h-11 px-3 rounded-lg border ${errors.fullName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#25D366]'} focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400`}
                />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Your store URL</label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="e.g. priyasarees"
                    className={`w-full h-11 px-3 pr-9 rounded-lg border ${errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#25D366]'} focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    {!checkingUsername && usernameAvailable === true && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {!checkingUsername && usernameAvailable === false && <XCircle className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
                {usernameCheckMsg && (
                  <p className={`text-xs font-medium mt-1 ${usernameAvailable ? 'text-green-600' : 'text-red-500'}`}>
                    {usernameCheckMsg}
                  </p>
                )}
                {!usernameCheckMsg && (
                  <p className="text-xs text-gray-400 mt-1">
                    Your store: {username ? `${username}.myshoplink.site` : 'username.myshoplink.site'}
                  </p>
                )}
                {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">WhatsApp number</label>
                <div className="flex gap-2">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const country = countryCodes.find(c => c.code === e.target.value);
                      if (country) setSelectedCountry(country);
                    }}
                    className="w-24 h-11 shrink-0 bg-gray-50 border border-gray-300 rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.dialCode}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="98765 43210"
                    className={`w-full h-11 px-3 rounded-lg border ${errors.whatsapp ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#25D366]'} focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Customers will contact you on this number to place orders</p>
                {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full h-11 px-3 rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#25D366]'} focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className={`w-full h-11 pl-3 pr-10 rounded-lg border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#25D366]'} focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center pt-0.5">
                    <input 
                      type="checkbox" 
                      checked={agreeTerms}
                      onChange={e => setAgreeTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#25D366] focus:ring-[#25D366] transition-colors cursor-pointer"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 leading-snug">
                    I agree to the <a href="#" className="underline hover:text-gray-900 transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-gray-900 transition-colors">Privacy Policy</a>
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-red-500 mt-1 ml-8">{errors.terms}</p>}
              </div>

              {authError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{authError}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-[52px] mt-4 rounded-xl bg-[#25D366] text-white font-semibold text-lg hover:bg-[#20bd5a] flex items-center justify-center gap-2 transition-all disabled:opacity-80 shadow-lg shadow-[#25D366]/20"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Store className="w-5 h-5" />}
                {isLoading ? "Creating your store..." : "Create My Free Store"}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-gray-100 pt-6">
              <button 
                onClick={() => { setIsLoginMode(true); setHasSubmitted(false); setAuthError(''); }}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Already have a store? Log in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
