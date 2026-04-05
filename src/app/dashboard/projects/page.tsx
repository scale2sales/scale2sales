// @ts-nocheck
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createProject, getProjects } from '@/lib/actions/projects'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useEffect } from 'react'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [description, setDescription] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState('')
  const [creating, setCreating] = useState(false)
  const [scanError, setScanError] = useState('')

  useEffect(() => {
    fetch('/api/projects/list')
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
  }, [])

  async function handleScan() {
    if (!websiteUrl.trim()) {
      setScanError('Please enter a website URL first')
      return
    }
    setScanning(true)
    setScanError('')
    setScanResult('')

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      })
      const data = await res.json()
      if (data.error) {
        setScanError(data.error)
      } else {
        setSystemPrompt(data.systemPrompt)
        setScanResult(`✅ Scanned ${data.pagesScraped} page${data.pagesScraped > 1 ? 's' : ''}! System prompt generated automatically.`)
      }
    } catch {
      setScanError('Failed to scan website. Please check the URL and try again.')
    }
    setScanning(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('website_url', websiteUrl)
    formData.append('description', description)
    formData.append('system_prompt', systemPrompt)
    await createProject(formData)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Each project is a chatbot for one of your products</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create form */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">New project</h2>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="Project name"
                  placeholder="My Website Bot"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />

                {/* Website URL + Scan button */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Website URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://mysite.com"
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={handleScan}
                      disabled={scanning}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-sm font-medium hover:bg-brand-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {scanning ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Scanning…
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                          </svg>
                          Scan Site
                        </>
                      )}
                    </button>
                  </div>

                  {/* Scan result */}
                  {scanResult && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded-lg mt-1">
                      {scanResult}
                    </div>
                  )}
                  {scanError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg mt-1">
                      {scanError}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Textarea
                    placeholder="What this chatbot is for..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* System prompt */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">System prompt</label>
                    {scanResult && (
                      <span className="text-xs text-green-600 font-medium">✅ Auto-generated</span>
                    )}
                  </div>
                  <Textarea
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    rows={6}
                    placeholder="You are a helpful assistant..."
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-gray-400">
                    This tells the AI how to behave. Click "Scan Site" to auto-generate from your website.
                  </p>
                </div>

                <Button type="submit" loading={creating} className="w-full">
                  Create project
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Project list */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Your projects ({projects.length})
          </h2>
          {projects.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No projects yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}/chat`}>
                  <Card className="hover:shadow-md hover:border-brand-200 transition-all cursor-pointer mb-3">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{project.name}</p>
                          {project.website_url && (
                            <p className="text-xs text-gray-400 truncate">{project.website_url}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <Link
                            href={`/dashboard/projects/${project.id}/embed`}
                            onClick={e => e.stopPropagation()}
                            className="text-xs text-brand-600 hover:underline"
                          >
                            Embed
                          </Link>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
