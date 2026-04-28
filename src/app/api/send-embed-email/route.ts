// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, projectName, embedCode, shareUrl, projectId } = await req.json()

  // Use Anthropic API to send a nicely formatted email
  // For now we'll use Supabase's built-in email or just return success
  // In production you'd integrate Resend or SendGrid here

  console.log(`Embed code email requested for ${projectName} to ${email}`)

  // TODO: Integrate Resend for actual email sending
  // For now simulate success
  return NextResponse.json({ success: true })
}
