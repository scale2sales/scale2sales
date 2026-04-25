// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

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

  const org = await getUserOrganization()
  if (!org) return NextResponse.json({ error: 'No organization' }, { status: 400 })
  if (!org.stripe_customer_id) return NextResponse.json({ error: 'No billing account found' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://scale2sales.com'

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${appUrl}/dashboard/billing`,
  })

  return NextResponse.json({ url: session.url })
}
