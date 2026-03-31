// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const key = 's2s_' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
  const prefix = key.slice(0, 12)
  // Simple hash for storage (in production use bcrypt)
  const hash = btoa(key)
  return { key, hash, prefix }
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, organizationId } = await req.json()

  if (!name || !organizationId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { key, hash, prefix } = generateApiKey()

  const { data: apiKey, error } = await admin.from('api_keys').insert({
    organization_id: organizationId,
    user_id: user.id,
    name,
    key_hash: hash,
    key_prefix: prefix,
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ key, apiKey })
}
