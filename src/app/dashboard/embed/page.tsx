// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddToWebsiteClient } from '@/components/dashboard/AddToWebsiteClient'

export const metadata = { title: 'Add to Your Website | Scale2Sales' }

export default async function AddToWebsitePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orgUser } = await supabase
    .from('org_users').select('organization_id')
    .eq('user_id', user.id).single()
  if (!orgUser) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, website_url, system_prompt')
    .eq('organization_id', orgUser.organization_id)
    .order('created_at', { ascending: false })

  return <AddToWebsiteClient projects={projects || []} userEmail={user.email} />
}
