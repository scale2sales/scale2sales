// @ts-nocheck  
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const priceId = subscription.items.data[0]?.price.id
      const plan = getPlanFromPriceId(priceId)

      await admin
        .from('organizations')
        .update({
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status as any,
          subscription_plan: plan,
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await admin
        .from('organizations')
        .update({
          subscription_status: 'canceled',
          subscription_plan: 'free',
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const orgId = session.metadata?.organization_id

      if (orgId) {
        await admin
          .from('organizations')
          .update({ stripe_customer_id: customerId })
          .eq('id', orgId)
      }

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      await admin
        .from('organizations')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId)

      break
    }

    default:
      console.log(`Unhandled webhook event: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

function getPlanFromPriceId(priceId: string): 'starter' | 'pro' | 'free' {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  return 'free'
}
