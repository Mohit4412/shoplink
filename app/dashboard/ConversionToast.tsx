'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ConversionToast() {
    const searchParams = useSearchParams()
    const success = searchParams.get('conversion')

    useEffect(() => {
        if (success === 'success') {
            const url = new URL(window.location.href)
            url.searchParams.delete('conversion')
            window.history.replaceState({}, '', url.toString())
        }
    }, [success])

    if (success !== 'success') return null

    return (
        <div className="fixed top-6 right-6 bg-black text-white px-4 py-3 rounded-xl shadow-xl z-50">
            🎉 Order confirmed successfully!
        </div>
    )
}