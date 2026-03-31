'use client'
// @ts-nocheck
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
}

export function ApiKeysManager({
  organizationId,
  initialKeys,
}: {
  organizationId: string
  initialKeys: ApiKey[]
}) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [newKeyName, setNewKeyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function createKey() {
    if (!newKeyName.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/keys/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName, organizationId }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) {
      setError(data.error)
    } else {
      setNewKey(data.key)
      setKeys(prev => [data.apiKey, ...prev])
      setNewKeyName('')
    }
  }

  async function deleteKey(id: string) {
    const res = await fetch('/api/keys/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, organizationId }),
    })

    if (res.ok) {
      setKeys(prev => prev.filter(k => k.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* New key revealed */}
      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-2">
            ✅ API Key created — copy it now, it won't be shown again!
          </p>
          <div className="flex items-center gap-3 bg-white border border-green-200 rounded-lg px-4 py-3">
            <code className="flex-1 text-sm font-mono text-gray-800 break-all">{newKey}</code>
            <button
              onClick={() => { navigator.clipboard.writeText(newKey); }}
              className="flex-shrink-0 text-xs text-brand-600 font-medium hover:underline"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="text-xs text-green-600 mt-2 hover:underline"
          >
            I've saved it, dismiss
          </button>
        </div>
      )}

      {/* Create new key */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Create New Key</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Key name (e.g. Production, My Website)"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createKey()}
              />
            </div>
            <Button onClick={createKey} loading={loading}>
              Generate Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing keys */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">
            Your Keys ({keys.length})
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          {keys.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              No API keys yet. Create one above to get started.
            </div>
          ) : (
            keys.map((key, i) => (
              <div
                key={key.id}
                className={`flex items-center justify-between px-6 py-4 ${
                  i < keys.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{key.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {key.key_prefix}••••••••••••••••••••••••••••••••
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at && ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => deleteKey(key.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Revoke
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
