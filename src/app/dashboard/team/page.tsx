// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { getUserOrganization } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { InviteTeamMember } from '@/components/dashboard/InviteTeamMember'

export const metadata = { title: 'Team' }

export default async function TeamPage() {
  const supabase = createClient()
  const org = await getUserOrganization()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: members } = await supabase
    .from('org_users')
    .select('*, user:user_id(email)')
    .eq('organization_id', org?.id)
    .order('created_at', { ascending: true })

  const { data: invitations } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('organization_id', org?.id)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  const currentMember = members?.find(m => m.user_id === user?.id)
  const isOwnerOrAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin'

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-gray-500 mt-1">Manage your organization members</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Members list */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Members ({members?.length ?? 0})
          </h2>
          <Card>
            <CardContent className="p-0">
              {members?.map((member, i) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between px-5 py-4 ${
                    i < members.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-brand-600">
                        {member.user?.email?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.user?.email}</p>
                      <p className="text-xs text-gray-400">
                        Joined {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={member.role === 'owner' ? 'info' : member.role === 'admin' ? 'warning' : 'default'}
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending invitations */}
          {invitations && invitations.length > 0 && (
            <div className="mt-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Pending Invitations ({invitations.length})
              </h2>
              <Card>
                <CardContent className="p-0">
                  {invitations.map((inv, i) => (
                    <div
                      key={inv.id}
                      className={`flex items-center justify-between px-5 py-4 ${
                        i < invitations.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                        <p className="text-xs text-gray-400">
                          Expires {new Date(inv.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Invite form */}
        {isOwnerOrAdmin && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Invite Member</h2>
            <InviteTeamMember organizationId={org?.id ?? ''} />
          </div>
        )}
      </div>
    </div>
  )
}
