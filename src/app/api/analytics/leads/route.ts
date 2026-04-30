// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orgId = req.nextUrl.searchParams.get('orgId')
  if (!orgId) return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })

  // Get all user messages and look for email patterns
  const { data: messages } = await supabase
    .from('messages')
    .select('content, created_at, conversation_id')
    .eq('organization_id', orgId)
    .eq('role', 'user')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (!messages) return NextResponse.json({ leads: [] })

  // Extract emails from messages
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const leads: any[] = []
  const seenEmails = new Set<string>()

  for (const msg of messages) {
    const emails = msg.content.match(emailRegex)
    if (emails) {
      for (const email of emails) {
        if (!seenEmails.has(email.toLowerCase())) {
          seenEmails.add(email.toLowerCase())
          leads.push({
            email: email.toLowerCase(),
            question: msg.content.replace(emailRegex, '[email]').slice(0, 80),
            projectName: 'Chatbot',
            capturedAt: msg.created_at,
          })
        }
      }
    }
  }

  return NextResponse.json({ leads })
}
