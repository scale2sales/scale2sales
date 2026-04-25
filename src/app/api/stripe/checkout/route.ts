// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, createOrRetrieveCustomer, PLANS } from '@/lib/stripe'

async function getUserOrganization() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: orgUser } = await supabase
    .from('org_users').select('organization_id')
    .eq('user_id', user.id).single()
  if (!orgUser) return null
  const { data: org } = await supabase
    .from('organizations').select('*')
    .eq('id', orgUser.organization_id).single()
  return org
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planKey, interval = 'month' } = await req.json()
  if (!planKey || !PLANS[planKey]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const plan = PLANS[planKey]
  const priceId = interval === 'year' ? plan.annualPriceId : plan.priceId
  if (!priceId) return NextResponse.json({ error: 'No price ID for this plan' }, { status: 400 })

  const org = await getUserOrganization()
  if (!org) return NextResponse.json({ error: 'No organization found' }, { status: 400 })

  const customerId = await createOrRetrieveCustomer({ email: user.email!, organizationId: org.id })

  await supabase.from('organizations').update({ stripe_customer_id: customerId }).eq('id', org.id)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://scale2sales.com'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=true&plan=${planKey}&interval=${interval}`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
    metadata: { organization_id: org.id, plan_key: planKey, interval },
    subscription_data: {
      metadata: { organization_id: org.id, plan_key: planKey },
      trial_period_days: 14,
    },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
