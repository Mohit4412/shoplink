'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ConversionToast() {
    const searchParams = useSearchParams()
    const success = searchParams.get('conversion')

    useEffect(() => {
        if (success === 'success') {
            alert('🎉 Order confirmed successfully!')
        }
    }, [success])

    return null
}