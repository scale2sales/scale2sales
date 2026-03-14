// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isSubscriptionActive } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Mock streaming AI response generator
async function* generateMockStream(message: string): AsyncGenerator<string> {
  const responses = [
    `Thanks for your message! You asked: "${message}". `,
    `I'm your AI assistant powered by ChatFlow. `,
    `I can help answer questions, provide information, and assist with various tasks. `,
    `This is a mock streaming response — connect a real AI provider like OpenAI or Anthropic to get live responses. `,
    `Feel free to ask me anything!`,
  ]

  for (const chunk of responses) {
    yield chunk
    await new Promise((resolve) => setTimeout(resolve, 80))
  }
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const admin = createAdminClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    message: string
    projectId: string
    conversationId: string | null
    organizationId: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { message, projectId, conversationId, organizationId } = body

  if (!message?.trim() || !projectId || !organizationId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify org membership
  const { data: orgUser } = await supabase
    .from('org_users')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!orgUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Check subscription
  const { data: org } = await supabase
    .from('organizations')
    .select('subscription_status, subscription_plan')
    .eq('id', organizationId)
    .single()

  const isActive = (org as any)?.subscription_plan === 'free' || isSubscriptionActive((org as any)?.subscription_status ?? null)
  if (!isActive) {
    return NextResponse.json({ error: 'Subscription inactive. Please upgrade.' }, { status: 402 })
  }

  // Get or create conversation
  let activeConversationId = conversationId

  if (!activeConversationId) {
    const { data: conv, error: convError } = await admin
      .from('conversations')
      .insert({
        organization_id: organizationId,
        project_id: projectId,
        user_id: user.id,
        title: message.slice(0, 60),
      })
      .select()
      .single()

    if (convError || !conv) {
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    activeConversationId = conv.id
  }

  // Store user message
  await admin.from('messages').insert({
    organization_id: organizationId,
    conversation_id: activeConversationId,
    role: 'user',
    content: message,
  })

  // Stream the response
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = ''

      try {
        for await (const chunk of generateMockStream(message)) {
          fullResponse += chunk
          const data = JSON.stringify({ delta: chunk })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }

        // Store assistant message
        const tokensUsed = Math.ceil(fullResponse.split(' ').length * 1.3)
        await admin.from('messages').insert({
          organization_id: organizationId,
          conversation_id: activeConversationId!,
          role: 'assistant',
          content: fullResponse,
          tokens_used: tokensUsed,
        })

        // Log usage
        await admin.from('usage_logs').insert({
          organization_id: organizationId,
          user_id: user.id,
          project_id: projectId,
          conversation_id: activeConversationId,
          tokens_input: Math.ceil(message.split(' ').length * 1.3),
          tokens_output: tokensUsed,
          model: 'mock-gpt-4',
          cost_usd: tokensUsed * 0.000002,
        })

        // Update conversation timestamp
        await admin
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeConversationId!)

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Conversation-Id': activeConversationId ?? '',
    },
  })
}
