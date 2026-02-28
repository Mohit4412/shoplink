import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
})

export async function POST(req: Request) {
    const { userId, email } = await req.json()

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        billing_address_collection: 'required',
        shipping_address_collection: {
            allowed_countries: ['IN'],
        },
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: 'Pro Plan',
                    },
                    unit_amount: 14900, // ₹149
                    recurring: { interval: 'month' },
                },
                quantity: 1,
            },
        ],
        metadata: {
            userId,
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
}