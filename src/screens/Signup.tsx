'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { countryCodes } from '../utils/countryCodes';

export function Signup() {
  const router = useRouter();
  const { hydrated, login, user } = useStore();
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [waError, setWaError] = useState('');
  const [authError, setAuthError] = useState('');

  React.useEffect(() => {
    if (hydrated && user) {
      router.replace('/dashboard');
    }
  }, [hydrated, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    const digits = whatsapp.replace(/\D/g, '');
    if (!isLoginMode && (digits.length < 10 || digits.length > 15)) {
      setWaError('Enter a valid WhatsApp number with country code');
      setIsLoading(false);
      return;
    }
    setWaError('');
    
    const fullWhatsapp = isLoginMode ? whatsapp : `${selectedCountry.dialCode}${digits}`;

    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username: username || email.split('@')[0],
          firstName,
          lastName,
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
      router.push('/dashboard');
    } catch (error) {
      setAuthError('Unable to connect right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
            <Store className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLoginMode ? 'Log in to ShopLink' : 'Create your ShopLink store'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLoginMode ? 'Welcome back!' : 'Start selling on WhatsApp in minutes'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLoginMode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <Input
                  label="Username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-store-name"
                  helperText="This will be your store URL"
                />
              </>
            )}

            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {!isLoginMode && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  WhatsApp Number
                </label>
                <div className="flex gap-2">
                  <div className="relative min-w-[100px]">
                    <select
                      value={selectedCountry.code}
                      onChange={(e) => {
                        const country = countryCodes.find(c => c.code === e.target.value);
                        if (country) setSelectedCountry(country);
                      }}
                      className="w-full h-11 rounded-lg border border-gray-300 bg-white pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors cursor-pointer"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.dialCode}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => { setWhatsapp(e.target.value); setWaError(''); }}
                      placeholder="Phone number"
                      className="w-full"
                    />
                  </div>
                </div>
                {waError && (
                  <p className="text-xs text-red-600 mt-1">{waError}</p>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading 
                ? (isLoginMode ? 'Logging in...' : 'Creating account...') 
                : (isLoginMode ? 'Log in' : 'Sign up')}
            </Button>
            {authError ? <p className="text-sm text-red-600">{authError}</p> : null}
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsLoginMode(!isLoginMode)}
              >
                {isLoginMode ? 'Create an account' : 'Log in'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
