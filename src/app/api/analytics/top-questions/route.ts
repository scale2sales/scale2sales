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

  // Get last 30 days of user messages
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: messages } = await supabase
    .from('messages')
    .select('content, created_at')
    .eq('organization_id', orgId)
    .eq('role', 'user')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(500)

  if (!messages || messages.length === 0) {
    return NextResponse.json({ questions: [] })
  }

  // Count similar questions
  const questionCounts: Record<string, { count: number; lastAsked: string }> = {}

  for (const msg of messages) {
    // Normalize question — lowercase and trim
    const normalized = msg.content.toLowerCase().trim().slice(0, 100)

    // Group similar questions by first 50 chars
    const key = normalized.slice(0, 50)

    if (questionCounts[key]) {
      questionCounts[key].count++
    } else {
      questionCounts[key] = {
        count: 1,
        lastAsked: msg.created_at,
      }
    }
  }

  // Sort by count and take top 8
  const topQuestions = Object.entries(questionCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 8)
    .map(([question, data]) => ({
      question: question.charAt(0).toUpperCase() + question.slice(1),
      count: data.count,
      lastAsked: data.lastAsked,
    }))

  return NextResponse.json({ questions: topQuestions })
}
