'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const countryCodes = [
    { code: '+91', label: '🇮🇳 India' },
    { code: '+1', label: '🇺🇸 USA' },
    { code: '+44', label: '🇬🇧 UK' },
    { code: '+971', label: '🇦🇪 UAE' }
]

export default function Onboarding() {
    const router = useRouter()

    const [userId, setUserId] = useState<string | null>(null)
    const [username, setUsername] = useState('')
    const [countryCode, setCountryCode] = useState('+91')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(false)
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser()

            if (!data.user) {
                router.push('/signup')
                return
            }

            setUserId(data.user.id)

            const { data: profile } = await supabase
                .from('users')
                .select('username, whatsapp_number')
                .eq('id', data.user.id)
                .single()

            // If already completed onboarding → dashboard
            if (profile?.username && profile?.whatsapp_number) {
                router.push('/dashboard')
            }
        }

        checkUser()
    }, [router])

    // Username availability check
    useEffect(() => {
        if (!username) {
            setUsernameAvailable(null)
            return
        }

        const checkAvailability = async () => {
            setChecking(true)

            const { data } = await supabase
                .from('users')
                .select('id')
                .eq('username', username)
                .maybeSingle()

            setUsernameAvailable(!data)
            setChecking(false)
        }

        const delay = setTimeout(checkAvailability, 500)
        return () => clearTimeout(delay)
    }, [username])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!usernameAvailable) return

        setLoading(true)

        await supabase
            .from('users')
            .update({
                username,
                whatsapp_number: `${countryCode}${phone}`
            })
            .eq('id', userId)

        router.push('/dashboard')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] dark:bg-[#121212] transition-colors duration-300 px-4">

            <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-8 animate-fadeIn">

                <h1 className="text-2xl font-bold text-center mb-2">
                    Welcome 👋
                </h1>

                <p className="text-sm text-gray-500 text-center mb-8">
                    Let’s set up your shop profile
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Username */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="yourbrand"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-black/10 text-sm"
                            required
                        />
                        {checking && (
                            <p className="text-xs text-gray-400 mt-2">Checking...</p>
                        )}
                        {usernameAvailable === false && (
                            <p className="text-xs text-red-500 mt-2">
                                Username already taken
                            </p>
                        )}
                        {usernameAvailable && (
                            <p className="text-xs text-green-500 mt-2">
                                Username available
                            </p>
                        )}
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            WhatsApp Number
                        </label>

                        <div className="flex gap-2 mt-2">
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-sm"
                            >
                                {countryCodes.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.label} {c.code}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="tel"
                                placeholder="9876543210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-black/10 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !usernameAvailable}
                        className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Complete Setup'}
                    </button>

                </form>
            </div>
        </div>
    )
}