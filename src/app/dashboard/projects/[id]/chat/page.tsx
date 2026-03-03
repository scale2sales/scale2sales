import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProject, getConversations, getMessages } from '@/lib/actions/projects'
import { getUserOrganization } from '@/lib/actions/auth'
import { ChatInterface } from '@/components/chat/ChatInterface'
import Link from 'next/link'

interface ChatPageProps {
  params: { id: string }
  searchParams: { conversation?: string }
}

export async function generateMetadata({ params }: ChatPageProps) {
  const project = await getProject(params.id)
  return { title: project ? `${project.name} — Chat` : 'Chat' }
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const project = await getProject(params.id)
  if (!project) notFound()

  const org = await getUserOrganization()
  if (!org) redirect('/login')

  const conversations = await getConversations(params.id)
  const activeConvId = searchParams.conversation ?? conversations[0]?.id ?? null
  const activeConversation = conversations.find((c) => c.id === activeConvId) ?? null
  const messages = activeConvId ? await getMessages(activeConvId) : []

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Conversation sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <Link
            href="/dashboard/projects"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Projects
          </Link>
          <p className="font-semibold text-gray-900 text-sm truncate">{project.name}</p>
        </div>

        <div className="px-3 py-3">
          <Link
            href={`/dashboard/projects/${params.id}/chat`}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-brand-600 bg-brand-50 hover:bg-brand-100 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New conversation
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/dashboard/projects/${params.id}/chat?conversation=${conv.id}`}
              className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                conv.id === activeConvId
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <p className="truncate">{conv.title ?? 'Untitled'}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(conv.updated_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          project={project}
          initialConversation={activeConversation}
          initialMessages={messages as any}
          organizationId={org.id}
        />
      </div>
    </div>
  )
}
