import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserOrganization } from '@/lib/actions/auth'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const org = await getUserOrganization()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar organization={org as any} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
