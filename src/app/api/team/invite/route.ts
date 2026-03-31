// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { email, role, organizationId } = await req.json()
  if (!email || !organizationId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const token = crypto.randomUUID()
  const { error } = await admin.from('team_invitations').insert({
    organization_id: organizationId,
    invited_by: user.id,
    email, role, token,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`
  return NextResponse.json({ success: true, inviteUrl })
}