'use client'

export const dynamic = 'force-dynamic'
import { useState } from 'react'
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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Check username availability
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .maybeSingle()

        if (existing) {
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

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-3 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Username (your public link)"
                    className="w-full border p-3 rounded-xl"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

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
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        required
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
                >
                    {loading ? 'Creating...' : 'Create Account'}
                </button>
            </form>
        </div>
    )
}