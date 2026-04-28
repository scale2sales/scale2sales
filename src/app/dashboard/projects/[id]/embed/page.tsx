// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EmbedPageClient } from '@/components/embed/EmbedPageClient'

export default async function EmbedPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  return <EmbedPageClient project={project} userEmail={user?.email} />
}
