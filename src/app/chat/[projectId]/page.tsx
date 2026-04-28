// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ShareChatClient } from '@/components/share/ShareChatClient'

export async function generateMetadata({ params }: { params: { projectId: string } }) {
  const supabase = createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('name, website_url')
    .eq('id', params.projectId)
    .single()

  if (!project) return { title: 'Chat' }

  return {
    title: `Chat with ${project.name} AI Assistant`,
    description: `Ask ${project.name} anything — powered by Scale2Sales AI`,
  }
}

export default async function ShareChatPage({ params }: { params: { projectId: string } }) {
  const supabase = createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, website_url, system_prompt')
    .eq('id', params.projectId)
    .single()

  if (!project) notFound()

  return <ShareChatClient project={project} />
}
