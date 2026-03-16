// @ts-nocheck

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Math.random().toString(36).slice(2, 6)
}

export async function signUp(formData: FormData) {
  const supabase = createClient()
  const admin = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const orgName = formData.get('org_name') as string

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError || !authData.user) {
    return { error: signUpError?.message ?? 'Sign up failed' }
  }

  // Create organization
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: orgName,
      slug: slugify(orgName),
    })
    .select()
    .single()

  if (orgError || !org) {
    return { error: 'Failed to create organization' }
  }

  // Link user to org as owner
  await admin.from('org_users').insert({
    organization_id: org.id,
    user_id: authData.user.id,
    role: 'owner',
  })

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signIn(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUserOrganization() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('org_users')
    .select('organizations(*)')
    .eq('user_id', user.id)
    .single()

  return data?.organizations ?? null
}
