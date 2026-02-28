'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Tab = 'profile' | 'links' | 'analytics'
type Theme = 'light' | 'dark'

export default function Dashboard() {
    const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [showUpgrade, setShowUpgrade] = useState(false)
    const upgradeRef = useRef<HTMLDivElement | null>(null)
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    const [theme, setTheme] = useState<Theme>('light')
    const [userId, setUserId] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [profile, setProfile] = useState<any>(null)
    const [links, setLinks] = useState<any[]>([])
    const [clickEvents, setClickEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        // Initialize theme
        const savedTheme = localStorage.getItem('theme') as Theme | null
        if (savedTheme === 'dark') {
            setTheme('dark')
            document.documentElement.classList.add('dark')
        }

        const loadData = async () => {
            const { data } = await supabase.auth.getUser()

            if (!data.user) {
                router.replace('/signup')
                return
            }

            const user = data.user

            setUserId(user.id)
            setEmail(user.email ?? null)

            const { data: profileData } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle()

            let finalProfile = profileData

            if (!profileData) {
                const { data: newProfile } = await supabase
                    .from('users')
                    .insert({
                        id: user.id,
                        email: user.email,
                        plan: 'free',
                        username: null,
                        whatsapp_number: null
                    })
                    .select()
                    .single()

                finalProfile = newProfile
            }

            setProfile(finalProfile)

            const { data: linkData } = await supabase
                .from('links')
                .select('*')
                .eq('user_id', user.id)
                .order('order_index', { ascending: true })

            setLinks(linkData || [])
            setLoading(false)

            const { data: clickData } = await supabase
                .from('click_events')
                .select('link_id, created_at, referrer')
                .eq('user_id', user.id)

            setClickEvents(clickData || [])
        }

        loadData()
    }, [router])

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark')
            localStorage.setItem('theme', 'dark')
            document.documentElement.classList.add('dark')
        } else {
            setTheme('light')
            localStorage.setItem('theme', 'light')
            document.documentElement.classList.remove('dark')
        }
    }

    useEffect(() => {
        const url = new URL(window.location.href)
        const success = url.searchParams.get('success')

        if (success === 'true' && profile?.plan !== 'pro') {
            supabase
                .from('users')
                .update({ plan: 'pro' })
                .eq('id', userId)
                .then(() => {
                    window.history.replaceState({}, document.title, '/dashboard')
                    window.location.reload()
                })
        }
    }, [profile, userId])


    // ALL useState
    // ALL useRef
    // ALL useEffect

    useEffect(() => {
        const url = new URL(window.location.href)
        const upgrade = url.searchParams.get('upgrade')

        if (upgrade === 'true') {
            setShowUpgradeModal(true)
            window.history.replaceState({}, document.title, '/dashboard')
        }
    }, [])
    if (loading) return null

    const handleUpgrade = async () => {
        const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                email,
            }),
        })

        const data = await res.json()

        if (data.url) {
            window.location.href = data.url
        }
    }
    if (loading) return null
    return (
        <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-sans sm:py-12 selection:bg-gray-200 transition-colors duration-200">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">

                <header className="mb-8 md:mb-10 flex justify-between items-start">

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
                            Dashboard
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">
                            Manage your boutique, products, and insights.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        {/* 🔥 Plan Badge */}
                        {profile?.plan && (
                            <button
                                onClick={() => {
                                    if (profile?.plan === 'free') {
                                        setShowUpgradeModal(true)
                                    }
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:opacity-80
        ${profile?.plan === 'pro'
                                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                        : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/10'
                                    }`}
                            >
                                {profile?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                            </button>
                        )}

                        {/* 🌙 Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full bg-white dark:bg-[#242424] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition shadow-sm border border-gray-200 dark:border-white/10"
                            aria-label="Toggle Dark Mode"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                    />
                                </svg>
                            )}
                        </button>

                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 bg-gray-100/80 dark:bg-white/5 p-1 rounded-xl w-full max-w-md transition-colors duration-200">
                    {['profile', 'links', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as Tab)}
                            className={`flex-1 capitalize py-2.5 px-4 rounded-[0.6rem] text-sm font-semibold transition-all duration-200 ${activeTab === tab
                                ? 'bg-white dark:bg-[#242424] text-black dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/10'
                                }`}
                        >
                            {tab === 'links' ? 'Products' : tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content Cards */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/10 p-6 md:p-8 min-h-[400px] transition-colors duration-200">
                    {activeTab === 'profile' && (
                        <ProfileTab profile={profile} email={email} />
                    )}

                    {activeTab === 'links' && (
                        <LinksTab
                            links={links}
                            userId={userId}
                            profile={profile}
                            email={email}
                            upgradeRef={upgradeRef}
                            showUpgrade={showUpgrade}
                            setShowUpgrade={setShowUpgrade}
                            setShowUpgradeModal={setShowUpgradeModal}
                            refreshLinks={async () => {
                                const { data } = await supabase
                                    .from('links')
                                    .select('*')
                                    .eq('user_id', userId)
                                    .order('order_index', { ascending: true })

                                setLinks(data || [])
                            }}
                        />
                    )}

                    {activeTab === 'analytics' && (
                        <AnalyticsTab links={links} profile={profile} clickEvents={clickEvents}
                            setShowUpgradeModal={setShowUpgradeModal} handleUpgrade={handleUpgrade} />
                    )}
                </div>
            </div>
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">

                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setShowUpgradeModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-lg mx-4">

                        <div className="relative bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#111111] text-white rounded-3xl shadow-2xl border border-white/10 p-10 overflow-hidden">

                            {/* Glow Accent */}
                            <div className="absolute -top-24 -right-24 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

                            {/* Close */}
                            <button
                                onClick={handleUpgrade}
                                className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
                            >
                                Upgrade Now
                            </button>

                            {/* Crown */}
                            <div className="text-center mb-8">
                                <div className="text-4xl mb-3">👑</div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    Upgrade to Pro
                                </h2>
                                <p className="text-white/60 text-sm mt-2">
                                    Unlock unlimited selling power
                                </p>
                            </div>

                            {/* Price */}
                            <div className="text-center mb-8">
                                <div className="flex items-end justify-center gap-2">
                                    <span className="text-5xl font-bold">₹149</span>
                                    <span className="text-white/60 text-sm mb-1">/ month</span>
                                </div>
                                <p className="text-xs text-white/40 mt-2">
                                    Cancel anytime. No hidden charges.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-4 mb-10 text-sm">
                                <Feature>Unlimited products</Feature>
                                <Feature>Advanced analytics & trends</Feature>
                                <Feature>Remove “Powered by” branding</Feature>
                                <Feature>Priority future features</Feature>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handleUpgrade}
                                className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
                            >
                                Upgrade Now
                            </button>

                            <p className="text-center text-xs text-white/40 mt-5">
                                Secure payments powered by Stripe
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
function Feature({ children }: any) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-green-400 text-base">✓</span>
            <span className="text-white/80">{children}</span>
        </div>
    )
}

/* ---------- Profile Tab ---------- */

function ProfileTab({ profile, email }: any) {
    const [bio, setBio] = useState(profile?.bio || '')
    const [whatsapp, setWhatsapp] = useState(profile?.whatsapp_number || '')
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setSuccess(false)

        await supabase
            .from('users')
            .update({
                bio,
                whatsapp_number: whatsapp
            })
            .eq('id', profile?.id)

        setSaving(false)
        setSuccess(true)

        setTimeout(() => setSuccess(false), 3000)
    }

    return (
        <form onSubmit={saveProfile} className="space-y-8 w-full">

            <div>
                <h2 className="text-lg font-bold text-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                    Account Settings
                </h2>
            </div>

            {/* Email */}
            <div className="bg-gray-50 dark:bg-[#1A1A1C] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Email
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    {email}
                </span>
            </div>

            {/* Username (Read Only) */}
            <div className="bg-gray-50 dark:bg-[#1A1A1C] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Username
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    @{profile?.username || '—'}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                    Your public shop link: bio.yourdomain.com/@{profile?.username || '—'}
                </p>
            </div>

            {/* WhatsApp Number */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    WhatsApp Number
                </label>
                <input
                    type="text"
                    placeholder="e.g. 919876543210"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-400 mt-1">
                    Include country code. No spaces.
                </p>
            </div>

            {/* Bio */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Bio
                </label>
                <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition text-gray-900 dark:text-gray-100"
                />
            </div>

            {/* Save Button */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition shadow-sm"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {success && (
                <p className="text-sm text-green-500 font-medium">
                    Profile updated successfully.
                </p>
            )}
        </form>
    )
}


/* ---------- Links Tab ---------- */

function LinksTab({ links, userId, profile, email, refreshLinks, upgradeRef, showUpgrade, setShowUpgrade, setShowUpgradeModal }: any) {
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const addProduct = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title) return

        // ✅ Safe Free Plan Limit
        if (profile?.plan === 'free' && links.length >= 3) {
            setShowUpgrade(true)
            return
        }

        setUploading(true)

        let imageUrl = null

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${crypto.randomUUID()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, imageFile)

            if (uploadError) {
                alert('Image upload failed')
                setUploading(false)
                return
            }

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName)

            imageUrl = data.publicUrl
        }

        await supabase.from('links').insert({
            user_id: userId,
            title,
            price,
            image_url: imageUrl,
            order_index: links.length + 1,
            in_stock: true,
            url: '#',
        })

        setTitle('')
        setPrice('')
        setImageFile(null)
        setUploading(false)
        refreshLinks()
    }

    const deleteProduct = async (id: string) => {
        await supabase.from('links').delete().eq('id', id)
        refreshLinks()
    }

    return (
        <div className="space-y-10">

            {/* Add Product Form */}
            <div>
                <h2 className="text-lg font-bold text-black dark:text-white mb-4">
                    Add New Product
                </h2>

                <form
                    onSubmit={addProduct}
                    className="space-y-4 bg-gray-50 dark:bg-[#242424] p-5 rounded-xl border border-gray-100 dark:border-white/5"
                >
                    <input
                        type="text"
                        placeholder="Product name"
                        className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm font-medium"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Price (e.g. ₹999)"
                            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm font-medium"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setImageFile(e.target.files?.[0] || null)
                            }
                            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm font-medium"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="bg-black dark:bg-[#333333] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 dark:hover:bg-[#444444] transition shadow-sm"
                    >
                        {uploading ? 'Uploading...' : 'Add Product'}
                    </button>
                </form>

                {/* 🔥 Upgrade Card */}
                {showUpgrade && (
                    <div
                        ref={upgradeRef}
                        className={`mt-8 relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white shadow-xl transition-all duration-700 ease-in-out
    ${showUpgrade
                                ? 'opacity-100 translate-y-0 max-h-[1000px] p-7'
                                : 'opacity-0 -translate-y-4 max-h-0 p-0 border-0'
                            }`}
                    >

                        {/* Glow Accent */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg">
                                👑
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Upgrade to Pro
                                </h3>
                                <p className="text-xs text-gray-300">
                                    Unlock unlimited growth
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                            You're currently on the Free Plan with a limit of 3 products.
                            Upgrade to Pro to add unlimited products and remove branding.
                        </p>

                        {/* Feature List */}
                        <ul className="space-y-2 mb-6 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Unlimited products
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Advanced analytics
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Remove “Powered by” branding
                            </li>
                        </ul>

                        {/* CTA */}
                        <button
                            onClick={async () => {
                                const res = await fetch('/api/create-checkout-session', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        userId,
                                        email,
                                    }),
                                })

                                const data = await res.json()
                                window.location.href = data.url
                            }}
                            className="w-full bg-white text-black py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2"
                        >
                            Upgrade to Pro
                        </button>

                    </div>
                )}
            </div>

            {/* Product List */}
            <div>
                <h2 className="text-lg font-bold text-black dark:text-white mb-4 border-b border-gray-100 dark:border-white/10 pb-3">
                    Your Products ({links.length})
                </h2>

                {links.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-gray-50 dark:bg-[#242424] rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                            No products added yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {links.map((link: any) => (
                            <div
                                key={link.id}
                                className="border border-gray-200 dark:border-white/10 p-5 rounded-xl bg-white dark:bg-[#242424]"
                            >
                                <div className="flex gap-4 items-start">
                                    {link.image_url ? (
                                        <img
                                            src={link.image_url}
                                            alt={link.title}
                                            className="w-16 h-16 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-[#1a1a1a]" />
                                    )}

                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {link.title}
                                        </div>
                                        {link.price && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {link.price}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => deleteProduct(link.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    )
}
function StatCard({ label, value, sub }: any) {
    return (
        <div className="bg-white dark:bg-[#1A1A1C] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                {label}
            </p>
            <p className="text-lg font-bold text-black dark:text-white truncate">
                {value}
            </p>
            {sub && (
                <div className="text-xs mt-1">
                    {sub}
                </div>
            )}
        </div>
    )
}
/* ---------- Analytics Tab ---------- */
function AnalyticsTab({ links, profile, clickEvents, handleUpgrade }: any) {
    const isFree = profile?.plan === 'free'

    const now = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(now.getDate() - 7)

    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(now.getDate() - 14)

    // Last 7 days
    const last7Days = clickEvents.filter((e: any) =>
        new Date(e.created_at) >= sevenDaysAgo
    )

    const totalClicks = last7Days.length

    // Previous 7 days
    const previous7Days = clickEvents.filter((e: any) => {
        const date = new Date(e.created_at)
        return date >= fourteenDaysAgo && date < sevenDaysAgo
    })

    const previousTotal = previous7Days.length

    // Growth calculation (AFTER totalClicks exists)
    let growth = 0

    if (previousTotal > 0) {
        growth = ((totalClicks - previousTotal) / previousTotal) * 100
    } else if (totalClicks > 0) {
        growth = 100
    }
    const isPositive = growth > 0
    const isNegative = growth < 0

    const growthLabel =
        growth === 0
            ? "No change"
            : `${isPositive ? "+" : ""}${growth.toFixed(1)}% vs last week`

    const growthColor =
        growth === 0
            ? "text-gray-500"
            : isPositive
                ? "text-green-600"
                : "text-red-600"

    const growthArrow =
        growth === 0
            ? ""
            : isPositive
                ? "↑"
                : "↓"
    const totalProducts = links.length

    // 🔹 Group clicks per product (last 7 days)
    const productMap: Record<string, number> = {}

    last7Days.forEach((event: any) => {
        productMap[event.link_id] = (productMap[event.link_id] || 0) + 1
    })

    const rankedProducts = links.map((link: any) => ({
        ...link,
        clicks: productMap[link.id] || 0
    })).sort((a: any, b: any) => b.clicks - a.clicks)

    const topProduct = rankedProducts[0]
    const maxClicks = Math.max(...rankedProducts.map((l: any) => l.clicks), 1)

    // 🔹 7-Day Trend
    const trendData = Array(7).fill(0)

    last7Days.forEach((event: any) => {
        const diff =
            Math.floor(
                (now.getTime() - new Date(event.created_at).getTime()) /
                (1000 * 60 * 60 * 24)
            )
        if (diff < 7) {
            trendData[6 - diff]++
        }
    })
    console.log("Click Events:", clickEvents)
    const maxTrend = Math.max(...trendData, 1)

    // 🔹 Traffic Source
    const sourceMap: Record<string, number> = {}

    last7Days.forEach((event: any) => {
        const source = event.referrer || 'direct'
        sourceMap[source] = (sourceMap[source] || 0) + 1
    })

    const topSource =
        Object.entries(sourceMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

    return (
        <div className="relative min-h-[400px]">

            {isFree && (
                <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md bg-white/70 dark:bg-black/70 rounded-xl">
                    <div className="text-center p-8 max-w-sm">
                        <div className="text-3xl mb-3">📊</div>
                        <h3 className="text-lg font-semibold mb-2">
                            Advanced Analytics
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
                            Unlock product insights with Pro.
                        </p>
                        <button
                            onClick={handleUpgrade}
                            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>
            )}

            <div className={isFree ? 'opacity-40 pointer-events-none' : ''}>

                <div>
                    <h2 className="text-lg font-bold text-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                        Advanced Analytics
                    </h2>
                </div>

                {links.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-[#1A1A1C] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-gray-500 text-sm">No analytics yet.</p>
                    </div>
                ) : (
                    <>
                        {/* Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <StatCard
                                label="Total Clicks (7d)"
                                value={totalClicks}
                                sub={
                                    <span
                                        className={`flex items-center gap-1 font-medium ${growthColor} transition-all duration-500`}
                                    >
                                        {growthArrow && (
                                            <span className="text-sm transition-transform duration-300 inline-block hover:-translate-y-0.5">
                                                {growthArrow}
                                            </span>
                                        )}
                                        {growthLabel}
                                    </span>
                                }
                            />
                            <StatCard label="Total Products" value={totalProducts} />
                            <StatCard
                                label="Top Product (7d)"
                                value={topProduct?.title || '—'}
                                sub={`${topProduct?.clicks || 0} clicks`}
                            />
                            <StatCard
                                label="Top Traffic Source"
                                value={topSource}
                                sub="Last 7 days"
                            />
                        </div>

                        {/* 7-Day Trend */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                7-Day Click Trend
                            </h3>

                            <div className="flex items-end gap-2 h-32">
                                {trendData.map((value: number, i: number) => (
                                    <div key={i} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-black rounded-t-md transition-all duration-500"
                                            style={{
                                                height: `${(value / maxTrend) * 100}%`
                                            }}
                                        ></div>
                                        <span className="text-[10px] text-gray-400 mt-2">
                                            D{i + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product Ranking */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                Product Performance (7d)
                            </h3>

                            <div className="space-y-4">
                                {rankedProducts.map((link: any, index: number) => (
                                    <div
                                        key={link.id}
                                        className="bg-white dark:bg-[#1A1A1C] p-4 rounded-xl border border-gray-100 dark:border-gray-800"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded-md">
                                                    #{index + 1}
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {link.title}
                                                </span>
                                            </div>

                                            <span className="text-xs font-semibold text-gray-500">
                                                {link.clicks} clicks
                                            </span>
                                        </div>

                                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                            <div
                                                className="bg-black h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${(link.clicks / maxClicks) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}