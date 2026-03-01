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

    // Detect referrer
    const rawReferrer = request.headers.get('referer') || 'direct'

    let source = 'direct'
    if (rawReferrer.includes('instagram')) source = 'instagram'
    else if (rawReferrer.includes('youtube')) source = 'youtube'
    else if (rawReferrer.includes('facebook')) source = 'facebook'
    else if (rawReferrer.includes('tiktok')) source = 'tiktok'
    else if (rawReferrer !== 'direct') source = 'other'

    // ✅ Generate order reference ONCE
    const orderRef = `SL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

    // Insert click event with order_ref
    await supabaseServer
        .from('click_events')
        .insert({
            link_id: linkId,
            user_id: product.user_id,
            referrer: source,
            order_ref: orderRef
        })

    // Increment total clicks
    await supabaseServer
        .from('links')
        .update({ clicks: (product.clicks ?? 0) + 1 })
        .eq('id', linkId)

    const confirmUrl = `https://shoplink-rho.vercel.app/confirm/${orderRef}`

    const cleanNumber = seller.whatsapp_number.replace(/\D/g, '')

    const message = encodeURIComponent(
        `Hi 👋 I'm interested in "${product.title}"${product.price ? ` (Price: ${product.price})` : ''
        }.

Order Ref: ${orderRef}

Confirm Order:
${confirmUrl}`
    )

    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`

    return NextResponse.redirect(whatsappUrl)
}