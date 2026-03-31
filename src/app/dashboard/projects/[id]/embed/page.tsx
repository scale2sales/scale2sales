// @ts-nocheck
import { getProject } from '@/lib/actions/projects'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { EmbedCodeGenerator } from '@/components/embed/EmbedCodeGenerator'

export const metadata = { title: 'Embed Widget' }

export default async function EmbedPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)
  if (!project) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-app.vercel.app'

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <a href="/dashboard/projects" className="hover:text-gray-700">Projects</a>
          <span>›</span>
          <span>{project.name}</span>
          <span>›</span>
          <span>Embed</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Embed Widget</h1>
        <p className="text-gray-500 mt-1">Add your chatbot to any website with one line of code</p>
      </div>

      <EmbedCodeGenerator project={project} appUrl={appUrl} />
    </div>
  )
}
