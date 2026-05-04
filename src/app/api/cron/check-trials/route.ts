// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTrialExpiryWarningEmail, sendTrialExpiredEmail } from '@/lib/emails'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find orgs in trial
    const { data: orgs } = await supabaseAdmin
      .from('organizations')
      .select('id, name, stripe_subscription_id, subscription_status, created_at')
      .eq('subscription_status', 'trialing')

    if (!orgs || orgs.length === 0) {
      return NextResponse.json({ message: 'No trialing orgs found' })
    }

    const now = new Date()
    const results = { warned: 0, expired: 0, errors: 0 }

    for (const org of orgs) {
      try {
        // Get org owner email
        const { data: orgUser } = await supabaseAdmin
          .from('org_users')
          .select('user_id')
          .eq('organization_id', org.id)
          .eq('role', 'owner')
          .single()

        if (!orgUser) continue

        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(orgUser.user_id)
        if (!user?.email) continue

        const email = user.email
        const name = user.user_metadata?.full_name || ''

        // Calculate trial days remaining (14 day trial from org creation)
        const trialStart = new Date(org.created_at)
        const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000)
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysLeft <= 0) {
          // Trial expired — send expired email and downgrade
          await sendTrialExpiredEmail({ email, name })
          await supabaseAdmin
            .from('organizations')
            .update({ subscription_status: 'inactive', subscription_plan: 'free' })
            .eq('id', org.id)
          results.expired++
        } else if (daysLeft === 2 || daysLeft === 1) {
          // Send warning email
          await sendTrialExpiryWarningEmail({ email, name, daysLeft })
          results.warned++
        }
      } catch (err) {
        console.error(`Error processing org ${org.id}:`, err)
        results.errors++
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    console.error('Trial check error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
