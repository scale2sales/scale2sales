// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const projectId = params.projectId

  // Verify project belongs to user's org
  const { data: orgUser } = await supabase
    .from('org_users').select('organization_id')
    .eq('user_id', user.id).single()

  if (!orgUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: project } = await supabase
    .from('projects').select('id, organization_id')
    .eq('id', projectId)
    .eq('organization_id', orgUser.organization_id)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  // Delete messages first
  await admin.from('messages')
    .delete()
    .in('conversation_id',
      admin.from('conversations').select('id').eq('project_id', projectId)
    )

  // Delete conversations
  await admin.from('conversations').delete().eq('project_id', projectId)

  // Delete usage logs
  await admin.from('usage_logs').delete().eq('project_id', projectId)

  // Delete project
  const { error } = await admin.from('projects').delete().eq('id', projectId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
