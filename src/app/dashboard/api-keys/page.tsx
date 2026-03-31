// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { getUserOrganization } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { ApiKeysManager } from '@/components/dashboard/ApiKeysManager'

export const metadata = { title: 'API Keys' }

export default async function ApiKeysPage() {
  const supabase = createClient()
  const org = await getUserOrganization()

  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .eq('organization_id', org?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <p className="text-gray-500 mt-1">Use API keys to access your chatbots programmatically</p>
      </div>

      {/* How to use */}
      <Card className="mb-8 border-brand-200 bg-brand-50">
        <CardContent className="py-4">
          <p className="text-sm font-semibold text-brand-800 mb-2">How to use your API key</p>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400">
            <p className="text-gray-400"># Send a message via API</p>
            <p>curl -X POST {process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-app.vercel.app'}/api/embed/PROJECT_ID \</p>
            <p>{'  '}-H &quot;Authorization: Bearer YOUR_API_KEY&quot; \</p>
            <p>{'  '}-H &quot;Content-Type: application/json&quot; \</p>
            <p>{'  '}-d &apos;{'{"message": "Hello!"}'}&apos;</p>
          </div>
        </CardContent>
      </Card>

      <ApiKeysManager
        organizationId={org?.id ?? ''}
        initialKeys={apiKeys ?? []}
      />
    </div>
  )
}
