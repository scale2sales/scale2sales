'use client'
// @ts-nocheck
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function InviteTeamMember({ organizationId }: { organizationId: string }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleInvite() {
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, organizationId }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) {
      setError(data.error)
    } else {
      setSuccess(true)
      setEmail('')
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            ✅ Invitation sent successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <Input
          label="Email address"
          type="email"
          placeholder="colleague@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="member">Member — can use projects</option>
            <option value="admin">Admin — can manage everything</option>
          </select>
        </div>
        <Button onClick={handleInvite} loading={loading} className="w-full">
          Send Invitation
        </Button>
        <p className="text-xs text-gray-400 text-center">
          They'll receive an email with a link to join your organization.
        </p>
      </CardContent>
    </Card>
  )
}
