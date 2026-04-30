// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist'
import { TopQuestionsWidget } from '@/components/dashboard/TopQuestionsWidget'
import { LeadCaptureList } from '@/components/dashboard/LeadCaptureList'
import { Greeting } from '@/components/dashboard/Greeting'

async function getDashboardData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orgUser } = await supabase
    .from('org_users').select('organization_id')
    .eq('user_id', user.id).single()
  if (!orgUser) redirect('/login')

  const orgId = orgUser.organization_id

  const [
    { data: org },
    { count: projectCount },
    { count: messageCount },
    { count: conversationCount },
    { data: recentConvs },
  ] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', orgId).single(),
    supabase.from('projects').select('id', { count: 'exact' }).eq('organization_id', orgId),
    supabase.from('messages').select('id', { count: 'exact' }).eq('organization_id', orgId).eq('role', 'user'),
    supabase.from('conversations').select('id', { count: 'exact' }).eq('organization_id', orgId),
    supabase.from('conversations').select('id, title, created_at').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(5),
  ])

  // Completed onboarding steps
  const completedSteps: string[] = []
  if (projectCount && projectCount > 0) completedSteps.push('create_project')
  if (messageCount && messageCount > 0) completedSteps.push('scan_website')
  if (messageCount && messageCount > 0) completedSteps.push('test_chat')
  if (conversationCount && conversationCount > 0) completedSteps.push('get_embed_code')
  if (org?.subscription_plan && org.subscription_plan !== 'free') completedSteps.push('upgrade_plan')

  // Monthly usage
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: monthlyMessages } = await supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .eq('organization_id', orgId)
    .eq('role', 'user')
    .gte('created_at', startOfMonth.toISOString())

  const planLimit = org?.subscription_plan === 'pro' ? 10000 : org?.subscription_plan === 'starter' ? 1000 : 50

  return {
    org,
    orgId,
    projectCount: projectCount ?? 0,
    messageCount: messageCount ?? 0,
    conversationCount: conversationCount ?? 0,
    monthlyMessages: monthlyMessages ?? 0,
    planLimit,
    recentConvs: recentConvs ?? [],
    completedSteps,
    showOnboarding: (projectCount ?? 0) < 3,
  }
}

export default async function DashboardPage() {
  const {
    org,
    orgId,
    projectCount,
    messageCount,
    conversationCount,
    monthlyMessages,
    planLimit,
    recentConvs,
    completedSteps,
    showOnboarding,
  } = await getDashboardData()

  const usagePercent = Math.min(Math.round((monthlyMessages / planLimit) * 100), 100)
  const isFree = org?.subscription_plan === 'free'

  const stats = [
    { label: 'Total Projects', value: projectCount, icon: '📁', href: '/dashboard/projects', color: 'bg-blue-50 text-blue-600' },
    { label: 'Customer questions answered', value: messageCount.toLocaleString(), icon: '💬', href: '/dashboard/analytics', color: 'bg-purple-50 text-purple-600' },
    { label: 'Conversations', value: conversationCount.toLocaleString(), icon: '🗨️', href: '/dashboard/analytics', color: 'bg-green-50 text-green-600' },
    { label: 'Messages this month', value: `${monthlyMessages} / ${planLimit}`, icon: '📊', href: '/dashboard/billing', color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Greeting name={org?.name} />
        <p className="text-gray-500 mt-1">Here is what is happening with your AI chatbots today.</p>
      </div>

      {/* Onboarding checklist */}
      {showOnboarding && (
        <OnboardingChecklist completedSteps={completedSteps} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-xl mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Usage bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-gray-900">Monthly usage</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {monthlyMessages.toLocaleString()} of {planLimit.toLocaleString()} messages used this month
            </p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-semibold ${usagePercent > 80 ? 'text-red-600' : 'text-gray-600'}`}>
              {usagePercent}%
            </span>
            {isFree && (
              <Link href="/dashboard/billing" className="block text-xs text-brand-600 hover:underline mt-1">
                Upgrade for more
              </Link>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-brand-500'}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        {usagePercent > 80 && (
          <p className="text-xs text-red-600 mt-2">
            Warning: You are approaching your monthly limit. Upgrade to avoid interruption.
          </p>
        )}
      </div>

      {/* Top Questions + Recent Conversations */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Top Questions */}
        <TopQuestionsWidget organizationId={orgId} />

        {/* Recent conversations */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent conversations</h2>
            <Link href="/dashboard/analytics" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {recentConvs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm text-gray-500">No conversations yet.</p>
              <Link href="/dashboard/projects" className="text-sm text-brand-600 hover:underline mt-1 block">
                Create a project to get started
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentConvs.map((conv) => (
                <div key={conv.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{conv.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-400">{new Date(conv.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lead Capture List */}
      <div className="mb-6">
        <LeadCaptureList organizationId={orgId} />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'New project', href: '/dashboard/projects', icon: '➕' },
            { label: 'Test chatbot', href: '/dashboard/projects', icon: '💬' },
            { label: 'View analytics', href: '/dashboard/analytics', icon: '📊' },
            { label: 'Manage billing', href: '/dashboard/billing', icon: '💳' },
            { label: 'Free tools', href: '/tools', icon: '🛠️' },
          ].map(action => (
            <Link key={action.label} href={action.href}>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-brand-50 hover:border-brand-200 border border-transparent transition-all cursor-pointer text-center">
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upgrade banner for free users */}
      {isFree && (
        <div className="bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">Upgrade to Starter</p>
              <p className="text-brand-200 text-sm mt-1">
                Get 1,000 messages/month, 5 projects, team members, and email support for just $29/mo.
              </p>
            </div>
            <Link
              href="/dashboard/billing"
              className="flex-shrink-0 bg-white text-brand-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors text-sm ml-4"
            >
              Upgrade now
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
