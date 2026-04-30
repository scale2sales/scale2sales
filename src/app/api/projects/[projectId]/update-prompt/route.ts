// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { systemPrompt } = await req.json()
  if (!systemPrompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })

  const { error } = await supabase
    .from('projects')
    .update({ system_prompt: systemPrompt })
    .eq('id', params.projectId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
