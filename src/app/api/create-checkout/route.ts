import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-06-24.dahlia' as any,
    })

    const { prenom } = await req.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://glowup-mvp.vercel.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: 'price_1Tn9yQC28mwMi0rAvxTdqv3d',
        quantity: 1,
      }],
      success_url: `${appUrl}/dashboard?premium=true`,
      cancel_url: `${appUrl}/dashboard`,
      metadata: { prenom: prenom || '' },
      locale: 'fr',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur paiement' }, { status: 500 })
  }
}
