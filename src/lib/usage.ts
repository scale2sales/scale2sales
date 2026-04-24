// @ts-nocheck
import { createClient } from '@/lib/supabase/server'

const PLAN_LIMITS = {
  free: 50,
  starter: 1000,
  pro: 10000,
}

export async function checkUsageLimit(organizationId: string) {
  const supabase = createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('subscription_plan')
    .eq('id', organizationId)
    .single()

  const plan = (org as any)?.subscription_plan ?? 'free'
  const limit = PLAN_LIMITS[plan] ?? 50

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .eq('organization_id', organizationId)
    .eq('role', 'user')
    .gte('created_at', startOfMonth.toISOString())

  const used = count ?? 0
  const allowed = used < limit
  const percentUsed = Math.round((used / limit) * 100)

  return { allowed, used, limit, plan, percentUsed }
}
