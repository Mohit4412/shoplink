import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ linkId: string }> }
) {
    const { linkId } = await params

    // Fetch product
    const { data: product } = await supabaseServer
        .from('links')
        .select('*')
        .eq('id', linkId)
        .maybeSingle()

    if (!product || !product.in_stock) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Fetch seller
    const { data: seller } = await supabaseServer
        .from('users')
        .select('whatsapp_number')
        .eq('id', product.user_id)
        .maybeSingle()

    if (!seller?.whatsapp_number) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Increment clicks safely
    await supabaseServer
        .from('links')
        .update({ clicks: (product.clicks ?? 0) + 1 })
        .eq('id', linkId)

    // Clean number (remove spaces, + etc)
    const cleanNumber = seller.whatsapp_number.replace(/\D/g, '')

    const message = encodeURIComponent(
        `Hi 👋 I'm interested in "${product.title}"${product.price ? ` (Price: ${product.price})` : ''}.`
    )

    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`

    return NextResponse.redirect(whatsappUrl)
}