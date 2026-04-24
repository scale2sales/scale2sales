// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isSubscriptionActive } from '@/lib/stripe'
import { checkUsageLimit } from '@/lib/usage'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { message, projectId, conversationId, organizationId } = body

  if (!message?.trim() || !projectId || !organizationId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: orgUser } = await supabase
    .from('org_users').select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id).single()
  if (!orgUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: org } = await supabase
    .from('organizations').select('subscription_status, subscription_plan')
    .eq('id', organizationId).single()

  const isActive = (org as any)?.subscription_plan === 'free' || isSubscriptionActive((org as any)?.subscription_status ?? null)
  if (!isActive) {
    return NextResponse.json({ error: 'Subscription inactive. Please upgrade.', code: 'SUBSCRIPTION_INACTIVE' }, { status: 402 })
  }

  // CHECK USAGE LIMITS
  const { allowed, used, limit, plan } = await checkUsageLimit(organizationId)
  if (!allowed) {
    return NextResponse.json({
      error: `You've used all ${limit} messages on your ${plan} plan this month. Upgrade to continue chatting.`,
      code: 'USAGE_LIMIT_EXCEEDED',
      used,
      limit,
      plan,
      upgradeUrl: '/dashboard/billing',
    }, { status: 429 })
  }

  const { data: project } = await supabase
    .from('projects').select('system_prompt, name')
    .eq('id', projectId).single()

  let activeConversationId = conversationId
  if (!activeConversationId) {
    const { data: conv, error: convError } = await admin
      .from('conversations').insert({
        organization_id: organizationId,
        project_id: projectId,
        user_id: user.id,
        title: message.slice(0, 60),
      }).select().single()
    if (convError || !conv) return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    activeConversationId = conv.id
  }

  await admin.from('messages').insert({
    organization_id: organizationId,
    conversation_id: activeConversationId,
    role: 'user',
    content: message,
  })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = ''
      let inputTokens = 0
      let outputTokens = 0
      try {
        const anthropicStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: (project?.system_prompt ?? 'You are a helpful assistant.') +
            '\n\nFormatting: Use ## for headers, **bold** for key terms, bullet points for lists. Keep responses concise.',
          messages: [{ role: 'user', content: message }],
        })

        for await (const event of anthropicStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk = event.delta.text
            fullResponse += chunk
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`))
          }
          if (event.type === 'message_start' && event.message.usage) inputTokens = event.message.usage.input_tokens
          if (event.type === 'message_delta' && event.usage) outputTokens = event.usage.output_tokens
        }

        await admin.from('messages').insert({
          organization_id: organizationId,
          conversation_id: activeConversationId,
          role: 'assistant',
          content: fullResponse,
          tokens_used: outputTokens,
        })

        await admin.from('usage_logs').insert({
          organization_id: organizationId,
          user_id: user.id,
          project_id: projectId,
          conversation_id: activeConversationId,
          tokens_input: inputTokens,
          tokens_output: outputTokens,
          model: 'claude-sonnet-4-20250514',
          cost_usd: (inputTokens * 0.000003) + (outputTokens * 0.000015),
        })

        await admin.from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeConversationId)

        // Send usage warning at 80%
        const newUsed = used + 1
        const newPercent = Math.round((newUsed / limit) * 100)
        if (newPercent >= 80 && plan === 'free') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            usageWarning: true,
            used: newUsed,
            limit,
            percent: newPercent,
          })}\n\n`))
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        console.error('Chat error:', err)
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
      'X-Usage-Used': String(used + 1),
      'X-Usage-Limit': String(limit),
    },
  })
}
