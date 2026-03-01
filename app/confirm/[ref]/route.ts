import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ ref: string }> }
) {
    const { ref } = await params

    if (!ref || !ref.startsWith('SL-')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    const shortId = ref.replace('SL-', '').toLowerCase()

    // Find click_event by matching first 8 chars
    const { data: clickEvent } = await supabaseServer
        .from('click_events')
        .select('*')
        .ilike('id', `${shortId}%`)
        .maybeSingle()

    if (!clickEvent) {
        return NextResponse.redirect(new URL('/?error=invalid_ref', request.url))
    }

    // Prevent duplicate conversion
    const { data: existingConversion } = await supabaseServer
        .from('conversions')
        .select('id')
        .eq('click_event_id', clickEvent.id)
        .maybeSingle()

    if (!existingConversion) {
        await supabaseServer.from('conversions').insert({
            user_id: clickEvent.user_id,
            link_id: clickEvent.link_id,
            click_event_id: clickEvent.id,
            status: 'completed'
        })
    }

    // Redirect seller to dashboard with success message
    return NextResponse.redirect(
        new URL('/dashboard?conversion=success', request.url)
    )
}