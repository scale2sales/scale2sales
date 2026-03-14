// @ts-nocheck

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrganization } from '@/lib/actions/auth'
import { getProjects } from '@/lib/actions/projects'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const org = await getUserOrganization()
  const projects = await getProjects()

  // Recent usage
  const { data: recentLogs } = await supabase
    .from('usage_logs')
    .select('tokens_input, tokens_output, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  const totalTokens = recentLogs?.reduce(
    (acc, l) => acc + l.tokens_input + l.tokens_output,
    0
  ) ?? 0

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {user?.email} · {org?.name ?? 'No organization'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Projects', value: projects.length },
          { label: 'Tokens used (recent)', value: totalTokens.toLocaleString() },
          { label: 'Plan', value: org?.subscription_plan ?? 'free', capitalize: true },
          {
            label: 'Status',
            value: org?.subscription_status ?? 'inactive',
            badge: true,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
              {stat.badge ? (
                <Badge
                  variant={stat.value === 'active' ? 'success' : 'warning'}
                  className="mt-1"
                >
                  {stat.value}
                </Badge>
              ) : (
                <p className={`text-2xl font-bold text-gray-900 mt-1 ${stat.capitalize ? 'capitalize' : ''}`}>
                  {stat.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your projects</h2>
        <Link
          href="/dashboard/projects"
          className="text-sm text-brand-600 font-medium hover:underline"
        >
          View all →
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No projects yet. Create one to get started.</p>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              + Create project
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.slice(0, 4).map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}/chat`}>
              <Card className="hover:shadow-md hover:border-brand-200 transition-all cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{project.name}</p>
                      {project.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{project.description}</p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
