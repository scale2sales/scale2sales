// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function* generateMockStream(message: string) {
  const responses = [
    `Thanks for reaching out! You asked: "${message}". `,
    `I'm here to help. `,
    `Feel free to ask me anything about our products or services!`,
  ]
  for (const chunk of responses) {
    yield chunk
    await new Promise(r => setTimeout(r, 80))
  }
}

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

  // Get or create a widget conversation
  let activeConversationId = conversationId

  if (!activeConversationId) {
    // Create anonymous conversation
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

  // Store user message
  if (activeConversationId) {
    await admin.from('messages').insert({
      organization_id: project.organization_id,
      conversation_id: activeConversationId,
      role: 'user',
      content: message,
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = ''

      try {
        for await (const chunk of generateMockStream(message)) {
          fullResponse += chunk
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`))
        }

        if (activeConversationId) {
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
        controller.error(err)
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
