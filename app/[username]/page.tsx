import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default async function UserPage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle()

    if (!user || userError) {
        return notFound()
    }

    const { data: links } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

    return (
        <div className="min-h-screen bg-[#fafafa] text-gray-900 flex justify-center sm:py-10">
            <div className="w-full max-w-md sm:bg-white sm:rounded-[2.5rem] sm:shadow-[0_8px_40px_rgb(0,0,0,0.04)] sm:overflow-hidden sm:border sm:border-gray-100 flex flex-col">

                {/* Header Section */}
                <div className="bg-white rounded-b-[2rem] sm:rounded-none sm:border-b border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] sm:shadow-none px-6 pt-12 pb-8 text-center relative z-10 shrink-0">
                    {user.profile_image ? (
                        <div className="relative inline-block mb-5">
                            <img
                                src={user.profile_image}
                                alt={user.username}
                                className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-gray-50 shadow-sm"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full mx-auto mb-5 bg-gray-50 flex items-center justify-center text-gray-400 text-3xl font-semibold ring-4 ring-gray-50 shadow-sm">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        {user.username}
                    </h1>

                    {user.bio && (
                        <p className="text-sm text-gray-500 mt-3 max-w-sm mx-auto leading-relaxed">
                            {user.bio}
                        </p>
                    )}
                </div>

                {/* Products Section */}
                <div className="px-5 py-8 space-y-7 grow">

                    {/* Micro Heading */}
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                            Collection
                        </h2>

                        {/* Highlight Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-medium text-white tracking-wide">
                                Live Orders
                            </span>
                        </div>
                    </div>

                    {links?.map((product) => (
                        <div
                            key={product.id}
                            className={`bg-white rounded-[1.25rem] border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 group relative block ${!product.in_stock ? 'opacity-60' : ''
                                }`}
                        >
                            {/* OUT OF STOCK BADGE */}
                            {!product.in_stock && (
                                <div className="absolute top-3 left-3 bg-black text-white text-[10px] px-3 py-1 rounded-full z-20">
                                    Out of Stock
                                </div>
                            )}

                            {product.image_url ? (
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                                    <img
                                        src={product.image_url}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            ) : (
                                <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                            )}

                            <div className="p-5">
                                <div className="flex justify-between items-start gap-4">
                                    <h2 className="font-semibold text-gray-900 text-base leading-snug">
                                        {product.title}
                                    </h2>

                                    {product.price && (
                                        <div className="shrink-0 font-medium text-gray-900 bg-gray-100/80 px-2.5 py-1 rounded-lg text-sm">
                                            {product.price}
                                        </div>
                                    )}
                                </div>

                                {product.in_stock ? (
                                    <a
                                        href={`/r/${product.id}`}
                                        className="mt-6 flex items-center justify-center gap-2 w-full bg-black text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-800 active:bg-gray-900 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow group/btn"
                                    >
                                        Order via WhatsApp
                                        <svg
                                            className="w-4 h-4 ml-0.5 transition-transform group-hover/btn:translate-x-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                        </svg>
                                    </a>
                                ) : (
                                    <div className="mt-6 flex items-center justify-center w-full bg-gray-200 text-gray-500 py-3.5 rounded-xl text-sm font-semibold cursor-not-allowed">
                                        Currently Unavailable
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center text-xs font-medium text-gray-400 pb-10 sm:pb-8 shrink-0">
                    Powered by <span className="text-gray-900">YourBrand</span>
                </div>

            </div>
        </div>
    )
}