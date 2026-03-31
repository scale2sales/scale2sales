// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { getUserOrganization } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts'

export const metadata = { title: 'Analytics' }

export default async function AnalyticsPage() {
  const supabase = createClient()
  const org = await getUserOrganization()

  // Last 30 days usage
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: usageLogs } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('organization_id', org?.id)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  const { data: messages } = await supabase
    .from('messages')
    .select('role, created_at')
    .eq('organization_id', org?.id)
    .gte('created_at', thirtyDaysAgo.toISOString())

  const { data: conversations } = await supabase
    .from('conversations')
    .select('created_at')
    .eq('organization_id', org?.id)
    .gte('created_at', thirtyDaysAgo.toISOString())

  // Aggregate stats
  const totalTokens = usageLogs?.reduce((acc, l) => acc + l.tokens_input + l.tokens_output, 0) ?? 0
  const totalCost = usageLogs?.reduce((acc, l) => acc + (l.cost_usd ?? 0), 0) ?? 0
  const totalMessages = messages?.filter(m => m.role === 'user').length ?? 0
  const totalConversations = conversations?.length ?? 0

  // Daily usage for chart
  const dailyUsage: Record<string, { tokens: number; messages: number; cost: number }> = {}
  usageLogs?.forEach((log) => {
    const date = new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (!dailyUsage[date]) dailyUsage[date] = { tokens: 0, messages: 0, cost: 0 }
    dailyUsage[date].tokens += log.tokens_input + log.tokens_output
    dailyUsage[date].messages += 1
    dailyUsage[date].cost += log.cost_usd ?? 0
  })

  const chartData = Object.entries(dailyUsage).map(([date, data]) => ({
    date,
    ...data,
  }))

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Usage statistics for the last 30 days</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Messages', value: totalMessages.toLocaleString(), icon: '💬' },
          { label: 'Conversations', value: totalConversations.toLocaleString(), icon: '🗣️' },
          { label: 'Tokens Used', value: totalTokens.toLocaleString(), icon: '⚡' },
          { label: 'Est. Cost', value: `$${totalCost.toFixed(4)}`, icon: '💰' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-5">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts data={chartData} />

      {/* Recent usage logs */}
      <Card className="mt-8">
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Model</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Input Tokens</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Output Tokens</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cost</th>
              </tr>
            </thead>
            <tbody>
              {usageLogs?.slice(-10).reverse().map((log) => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(log.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-gray-600 font-mono text-xs">{log.model}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{log.tokens_input}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{log.tokens_output}</td>
                  <td className="px-6 py-3 text-right text-gray-600">${(log.cost_usd ?? 0).toFixed(6)}</td>
                </tr>
              ))}
              {(!usageLogs || usageLogs.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No usage data yet. Start chatting to see analytics!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
