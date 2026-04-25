// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { BillingClient } from '@/components/dashboard/BillingClient'
import { PLANS } from '@/lib/stripe'

export const metadata = { title: 'Billing & Plans | Scale2Sales' }

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

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string; plan?: string; interval?: string }
}) {
  const supabase = createClient()
  const org = await getUserOrganization()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: messageCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .eq('organization_id', org?.id)
    .eq('role', 'user')
    .gte('created_at', startOfMonth.toISOString())

  const { count: projectCount } = await supabase
    .from('projects')
    .select('id', { count: 'exact' })
    .eq('organization_id', org?.id)

  const { data: usageLogs } = await supabase
    .from('usage_logs')
    .select('tokens_input, tokens_output')
    .eq('organization_id', org?.id)
    .gte('created_at', startOfMonth.toISOString())

  const totalTokens = usageLogs?.reduce((acc, l) => acc + (l.tokens_input || 0) + (l.tokens_output || 0), 0) ?? 0

  const currentPlan = org?.subscription_plan ?? 'free'
  const planLimits = PLANS[currentPlan]

  return (
    <BillingClient
      org={org}
      currentPlan={currentPlan}
      planLimits={planLimits}
      usage={{ messages: messageCount ?? 0, projects: projectCount ?? 0, tokens: totalTokens }}
      success={searchParams.success === 'true'}
      canceled={searchParams.canceled === 'true'}
      successPlan={searchParams.plan}
    />
  )
}
