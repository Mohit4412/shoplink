'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const countryCodes = [
    { code: '+91', label: '🇮🇳 +91' },
    { code: '+1', label: '🇺🇸 +1' },
    { code: '+44', label: '🇬🇧 +44' },
    { code: '+971', label: '🇦🇪 +971' }
]

export default function SignupPage() {
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [countryCode, setCountryCode] = useState('+91')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [usernameStatus, setUsernameStatus] = useState<
        'idle' | 'checking' | 'available' | 'taken'
    >('idle')

    const [suggestions, setSuggestions] = useState<string[]>([])
    const [signupAttempts, setSignupAttempts] = useState(0)

    // 🔐 Password Strength
    const getPasswordStrength = () => {
        let score = 0
        if (password.length >= 6) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++
        return score
    }

    const strength = getPasswordStrength()

    // 🔎 Username Check + Suggestions
    useEffect(() => {
        if (username.length < 3) {
            setUsernameStatus('idle')
            setSuggestions([])
            return
        }

        const delay = setTimeout(async () => {
            setUsernameStatus('checking')

            const { data } = await supabase
                .from('users')
                .select('id')
                .eq('username', username.toLowerCase())
                .maybeSingle()

            if (data) {
                setUsernameStatus('taken')

                // Generate suggestions
                const random1 = username + Math.floor(Math.random() * 100)
                const random2 = username + '_' + Math.floor(Math.random() * 999)
                const random3 = username + Date.now().toString().slice(-3)

                setSuggestions([random1, random2, random3])
            } else {
                setUsernameStatus('available')
                setSuggestions([])
            }
        }, 500)

        return () => clearTimeout(delay)
    }, [username])

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()

        // 🛑 Rate Limit (max 5 attempts per session)
        if (signupAttempts >= 5) {
            setError('Too many attempts. Please refresh and try again.')
            return
        }

        setSignupAttempts(prev => prev + 1)
        setLoading(true)
        setError(null)

        // Basic validation
        if (username.length < 3) {
            setError('Username must be at least 3 characters')
            setLoading(false)
            return
        }

        if (strength < 2) {
            setError('Password is too weak')
            setLoading(false)
            return
        }

        if (phone.length < 8) {
            setError('Enter valid WhatsApp number')
            setLoading(false)
            return
        }

        if (usernameStatus === 'taken') {
            setError('Username already taken')
            setLoading(false)
            return
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        if (data.user) {
            await supabase.from('users').insert({
                id: data.user.id,
                email: data.user.email,
                username: username.toLowerCase(),
                whatsapp_number: `${countryCode}${phone}`,
                plan: 'free'
            })
        }

        setLoading(false)
        router.push('/dashboard')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-4">
            <form
                onSubmit={handleSignup}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-5"
            >
                <h1 className="text-2xl font-bold text-center">
                    Create Your Shop
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-3 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                {/* PASSWORD */}
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border p-3 rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* Strength Meter */}
                    {password && (
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${strength <= 1
                                    ? 'bg-red-500 w-1/4'
                                    : strength === 2
                                        ? 'bg-yellow-500 w-2/4'
                                        : strength === 3
                                            ? 'bg-blue-500 w-3/4'
                                            : 'bg-green-500 w-full'
                                    }`}
                            />
                        </div>
                    )}
                </div>

                {/* USERNAME */}
                <div>
                    <input
                        type="text"
                        placeholder="Username (your public link)"
                        className="w-full border p-3 rounded-xl"
                        value={username}
                        onChange={(e) =>
                            setUsername(
                                e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                            )
                        }
                        required
                    />

                    {/* Status */}
                    <div className="mt-1 text-sm h-5">
                        {usernameStatus === 'checking' && (
                            <span className="text-gray-500 animate-pulse">
                                Checking...
                            </span>
                        )}

                        {usernameStatus === 'available' && (
                            <span className="text-green-600 flex items-center gap-1 animate-bounce">
                                ✓ Available
                            </span>
                        )}

                        {usernameStatus === 'taken' && (
                            <span className="text-red-500">
                                Username taken
                            </span>
                        )}
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                            Suggestions:
                            <div className="flex gap-2 mt-1 flex-wrap">
                                {suggestions.map((s) => (
                                    <button
                                        type="button"
                                        key={s}
                                        onClick={() => setUsername(s)}
                                        className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="border p-3 rounded-xl"
                    >
                        {countryCodes.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.label}
                            </option>
                        ))}
                    </select>

                    <input
                        type="tel"
                        placeholder="WhatsApp number"
                        className="flex-1 border p-3 rounded-xl"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, ''))
                        }
                        required
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading || usernameStatus === 'taken'}
                    className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Account'}
                </button>
            </form>
        </div>
    )
}