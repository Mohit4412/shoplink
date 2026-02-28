'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function SignupPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        // Create row in users table
        if (data.user) {
            await supabase.from('users').insert({
                id: data.user.id,
                email: data.user.email,
                username: null,
            })
        }

        setLoading(false)
        router.push('/signup')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white text-black px-4">
            <form
                onSubmit={handleSignup}
                className="w-full max-w-sm space-y-4"
            >
                <h1 className="text-2xl font-bold text-center">Create Account</h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-3 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-3 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
                >
                    {loading ? 'Creating...' : 'Sign Up'}
                </button>
            </form>
        </div>
    )
}