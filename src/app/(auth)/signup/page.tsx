// @ts-nocheck
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    const result = await signUp(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result?.success) {
      // Email confirmation required — show check email screen
      setSuccessEmail(result.email || email)
      setSuccess(true)
      setLoading(false)
    }
    // If no result — server redirected to dashboard directly (no email confirmation)
  }

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Scale2Sales</span>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email!</h2>
            <p className="text-gray-500 text-sm mb-4">
              We sent a confirmation link to <strong>{successEmail}</strong>. Click it to activate your account and get started.
            </p>
            <p className="text-xs text-gray-400">
              Did not receive it? Check your spam folder or{' '}
              <button
                onClick={() => { setSuccess(false); setLoading(false); }}
                className="text-brand-600 hover:underline"
              >
                try again
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-sm text-gray-500 mt-1">Start building AI chatbots today</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <Input
              name="full_name"
              type="text"
              label="Your name"
              placeholder="John Smith"
              required
              autoComplete="name"
            />
            <Input
              name="org_name"
              type="text"
              label="Company / Organization"
              placeholder="Acme Inc."
              autoComplete="organization"
            />
            <Input
              name="email"
              type="email"
              label="Work email"
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Button type="submit" loading={loading} className="w-full">
              Create account
            </Button>
            <p className="text-xs text-center text-gray-400">
              By creating an account you agree to our{' '}
              <a href="/terms" className="underline">Terms</a> and{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>.
            </p>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
