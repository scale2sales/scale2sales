// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getAnalyticsData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orgUser } = await supabase
    .from('org_users').select('organization_id')
    .eq('user_id', user.id).single()
  if (!orgUser) redirect('/login')

  const orgId = orgUser.organization_id

  // Date ranges
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    { count: totalConversations },
    { count: thisMonthConversations },
    { count: lastMonthConversations },
    { count: thisWeekConversations },
    { count: totalMessages },
    { count: thisMonthMessages },
    { data: projects },
    { data: recentMessages },
    { data: dailyData },
  ] = await Promise.all([
    supabase.from('conversations').select('id', { count: 'exact' }).eq('organization_id', orgId),
    supabase.from('conversations').select('id', { count: 'exact' }).eq('organization_id', orgId).gte('created_at', startOfMonth.toISOString()),
    supabase.from('conversations').select('id', { count: 'exact' }).eq('organization_id', orgId).gte('created_at', startOfLastMonth.toISOString()).lte('created_at', endOfLastMonth.toISOString()),
    supabase.from('conversations').select('id', { count: 'exact' }).eq('organization_id', orgId).gte('created_at', sevenDaysAgo.toISOString()),
    supabase.from('messages').select('id', { count: 'exact' }).eq('organization_id', orgId).eq('role', 'user'),
    supabase.from('messages').select('id', { count: 'exact' }).eq('organization_id', orgId).eq('role', 'user').gte('created_at', startOfMonth.toISOString()),
    supabase.from('projects').select('id, name').eq('organization_id', orgId),
    supabase.from('messages').select('content, created_at').eq('organization_id', orgId).eq('role', 'user').order('created_at', { ascending: false }).limit(5),
    supabase.from('conversations').select('created_at').eq('organization_id', orgId).gte('created_at', thirtyDaysAgo.toISOString()),
  ])

  // Conversations per project
  const projectStats = await Promise.all(
    (projects || []).map(async (p) => {
      const { count } = await supabase
        .from('conversations')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId)
        .eq('project_id', p.id)
      return { name: p.name, conversations: count ?? 0 }
    })
  )

  // Build daily chart data (last 14 days)
  const dailyMap: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dailyMap[key] = 0
  }
  for (const conv of dailyData || []) {
    const d = new Date(conv.created_at)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (key in dailyMap) dailyMap[key]++
  }

  // Growth vs last month
  const growth = lastMonthConversations
    ? Math.round(((thisMonthConversations - lastMonthConversations) / lastMonthConversations) * 100)
    : thisMonthConversations > 0 ? 100 : 0

  // Busiest day of week
  const dayCount: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 }
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  for (const conv of dailyData || []) {
    const day = days[new Date(conv.created_at).getDay()]
    dayCount[day]++
  }
  const busiestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'

  return {
    totalConversations: totalConversations ?? 0,
    thisMonthConversations: thisMonthConversations ?? 0,
    lastMonthConversations: lastMonthConversations ?? 0,
    thisWeekConversations: thisWeekConversations ?? 0,
    totalMessages: totalMessages ?? 0,
    thisMonthMessages: thisMonthMessages ?? 0,
    projectStats: projectStats.sort((a, b) => b.conversations - a.conversations),
    recentMessages: recentMessages ?? [],
    dailyChart: Object.entries(dailyMap).map(([date, count]) => ({ date, count })),
    growth,
    busiestDay,
    orgId,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  const maxDaily = Math.max(...data.dailyChart.map(d => d.count), 1)
  const maxProject = Math.max(...data.projectStats.map(p => p.conversations), 1)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">See how your AI chatbot is performing</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total conversations',
            value: data.totalConversations.toLocaleString(),
            sub: `${data.thisWeekConversations} this week`,
            icon: '💬',
            color: 'bg-brand-50 text-brand-600',
          },
          {
            label: 'This month',
            value: data.thisMonthConversations.toLocaleString(),
            sub: data.growth >= 0 ? `+${data.growth}% vs last month` : `${data.growth}% vs last month`,
            subColor: data.growth >= 0 ? 'text-green-600' : 'text-red-500',
            icon: '📅',
            color: 'bg-green-50 text-green-600',
          },
          {
            label: 'Questions answered',
            value: data.totalMessages.toLocaleString(),
            sub: `${data.thisMonthMessages} this month`,
            icon: '🙋',
            color: 'bg-purple-50 text-purple-600',
          },
          {
            label: 'Busiest day',
            value: data.busiestDay,
            sub: 'Most conversations',
            icon: '🔥',
            color: 'bg-orange-50 text-orange-600',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-xl mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            {stat.sub && (
              <p className={`text-xs mt-0.5 font-medium ${stat.subColor || 'text-gray-400'}`}>
                {stat.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Daily chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">Conversations - last 14 days</h2>
          {data.thisMonthConversations === 0 && (
            <span className="text-xs text-gray-400">No data yet</span>
          )}
        </div>
        {data.totalConversations === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📈</p>
            <p className="text-sm text-gray-500">No conversations yet.</p>
            <p className="text-xs text-gray-400 mt-1">Data will appear here once visitors start chatting.</p>
            <Link href="/dashboard/projects" className="text-sm text-brand-600 hover:underline mt-2 block">
              Create a project to get started
            </Link>
          </div>
        ) : (
          <div className="flex items-end gap-1.5 h-40">
            {data.dailyChart.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full">
                  <div
                    className="w-full bg-brand-500 rounded-t-md hover:bg-brand-600 transition-colors cursor-default"
                    style={{ height: `${Math.max((day.count / maxDaily) * 128, day.count > 0 ? 4 : 0)}px` }}
                    title={`${day.count} conversation${day.count !== 1 ? 's' : ''}`}
                  />
                </div>
                <p className="text-xs text-gray-400 rotate-45 origin-left mt-1 hidden md:block"
                   style={{ fontSize: '9px' }}>
                  {day.date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project breakdown + Recent activity */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Per project */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Conversations per chatbot</h2>
          {data.projectStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No projects yet.</p>
              <Link href="/dashboard/projects" className="text-sm text-brand-600 hover:underline mt-1 block">Create a project</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.projectStats.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800 truncate">{p.name}</span>
                    <span className="text-gray-500 ml-2 flex-shrink-0">{p.conversations}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full"
                      style={{ width: `${(p.conversations / maxProject) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent questions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent customer questions</h2>
          {data.recentMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No questions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentMessages.map((msg, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <span className="text-lg flex-shrink-0">❓</span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2">{msg.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Growth tip */}
      {data.totalConversations > 0 && data.totalConversations < 50 && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 flex items-start gap-4">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-brand-900">Tip: Get more conversations</p>
            <p className="text-sm text-brand-700 mt-1">
              Share your chatbot link on your social media, email signature, and Google Business Profile to get more visitors chatting.
            </p>
            <Link href="/dashboard/embed" className="text-sm text-brand-600 font-medium hover:underline mt-2 block">
              Get your share link
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
