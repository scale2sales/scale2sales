// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth callback called:', { code: !!code, token_hash: !!token_hash, type })

  try {
    const supabase = createClient()

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      console.log('Code exchange result:', { user: data?.user?.email, error: error?.message })
      if (!error && data.session) {
        const response = NextResponse.redirect(`${origin}/dashboard`)
        return response
      }
    }

    if (token_hash && type) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      })
      console.log('OTP verify result:', { user: data?.user?.email, error: error?.message })
      if (!error && data.session) {
        const response = NextResponse.redirect(`${origin}/dashboard`)
        return response
      }
      if (error) {
        console.error('OTP error:', error.message)
        // Token might be expired - redirect to login with message
        if (error.message.includes('expired')) {
          return NextResponse.redirect(`${origin}/login?error=link_expired`)
        }
      }
    }
  } catch (err) {
    console.error('Callback error:', err)
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
