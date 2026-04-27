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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signUp(new FormData(e.currentTarget))

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
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
              name="org_name"
              type="text"
              label="Company / Organization"
              placeholder="Acme Inc."
              required
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
