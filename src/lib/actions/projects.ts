 // @ts-nocheck

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserOrganization } from './auth'

export async function createProject(formData: FormData) {
  const supabase = createClient()
  const org = await getUserOrganization()

  if (!org) {
    return { error: 'No organization found' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const website_url = formData.get('website_url') as string
  const system_prompt = formData.get('system_prompt') as string

  const { data, error } = await supabase
    .from('projects')
    .insert({
      organization_id: org.id,
      name,
      description: description || null,
      website_url: website_url || null,
      system_prompt: system_prompt || 'You are a helpful assistant.',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/projects')
  redirect(`/dashboard/projects/${data.id}/chat`)
}

export async function getProjects() {
  const supabase = createClient()
  const org = await getUserOrganization()
  if (!org) return []

  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getProject(projectId: string) {
  const supabase = createClient()

  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  return data
}

export async function deleteProject(projectId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/projects')
  redirect('/dashboard/projects')
}

export async function getConversations(projectId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return data ?? []
}

export async function getMessages(conversationId: string) {
  const supabase = createClient()

  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  return data ?? []
}

export async function createConversation(projectId: string, orgId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      organization_id: orgId,
      project_id: projectId,
      user_id: user.id,
      title: 'New conversation',
    })
    .select()
    .single()

  if (error) throw error
  return data
}
