// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const admin = createAdminClient()
  const { projectId } = params
  const { message, conversationId } = await req.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }

  // Get project
  const { data: project } = await admin
    .from('projects')
    .select('id, organization_id, system_prompt, name')
    .eq('id', projectId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Get or create conversation
  let activeConversationId = conversationId
  if (!activeConversationId) {
    const { data: conv } = await admin
      .from('conversations')
      .insert({
        organization_id: project.organization_id,
        project_id: projectId,
        user_id: '00000000-0000-0000-0000-000000000000',
        title: message.slice(0, 60),
      })
      .select()
      .single()
    if (conv) activeConversationId = conv.id
  }

  // Get conversation history
  let history = []
  if (activeConversationId) {
    const { data: prevMessages } = await admin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(20)
    if (prevMessages) history = prevMessages
  }

  // Store user message
  if (activeConversationId) {
    await admin.from('messages').insert({
      organization_id: project.organization_id,
      conversation_id: activeConversationId,
      role: 'user',
      content: message,
    })
  }

  // Build messages for Claude
  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  const systemPrompt = project.system_prompt ||
    `You are a helpful AI assistant for ${project.name}. Answer customer questions helpfully and accurately.`

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = ''
      try {
        const claudeStream = await anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        })

        for await (const chunk of claudeStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const text = chunk.delta.text
            fullResponse += text
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`)
            )
          }
        }

        // Store assistant response
        if (activeConversationId && fullResponse) {
          await admin.from('messages').insert({
            organization_id: project.organization_id,
            conversation_id: activeConversationId,
            role: 'assistant',
            content: fullResponse,
          })
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        console.error('Widget chat error:', err)
        const errMsg = 'Sorry, something went wrong. Please try again.'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ delta: errMsg })}\n\n`)
        )
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'X-Conversation-Id': activeConversationId ?? '',
    },
  })
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
