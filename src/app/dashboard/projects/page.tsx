// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createProject } from '@/lib/actions/projects'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [description, setDescription] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.')
  const [creating, setCreating] = useState(false)

  // Scraper state
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanMessage, setScanMessage] = useState('')
  const [scanComplete, setScanComplete] = useState(false)
  const [scanError, setScanError] = useState('')
  const [pagesScanned, setPagesScanned] = useState(0)
  const [pagesList, setPagesList] = useState([])
  const [showPages, setShowPages] = useState(false)

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
    setScanComplete(false)
    setScanProgress(0)
    setScanMessage('Starting scan...')
    setPagesScanned(0)
    setPagesList([])

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl, maxPages: 15 }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value, { stream: true }).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'progress') {
                setScanProgress(data.progress)
                setScanMessage(data.message)
                if (data.pagesScanned) setPagesScanned(data.pagesScanned)
              }

              if (data.type === 'complete') {
                setScanProgress(100)
                setScanMessage(data.message)
                setPagesScanned(data.pagesScanned)
                setPagesList(data.pagesList || [])
                setSystemPrompt(data.systemPrompt)
                setScanComplete(true)
                setScanning(false)
              }

              if (data.type === 'error') {
                setScanError(data.message)
                setScanning(false)
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setScanError('Failed to connect. Please try again.')
      setScanning(false)
    }
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-500 mt-1">Each project is a chatbot for one of your products</p>
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

                {/* Website URL + Scan */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Website URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://mysite.com"
                      value={websiteUrl}
                      onChange={e => { setWebsiteUrl(e.target.value); setScanComplete(false); setScanError('') }}
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
                          {scanComplete ? 'Re-scan' : 'Scan Site'}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Progress bar */}
                  {(scanning || scanComplete) && !scanError && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">{scanMessage}</p>
                        <p className="text-xs text-gray-400">{scanProgress}%</p>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      {pagesScanned > 0 && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {scanComplete ? '✅' : '🔍'} {pagesScanned} page{pagesScanned !== 1 ? 's' : ''} scanned
                          </p>
                          {scanComplete && pagesList.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setShowPages(!showPages)}
                              className="text-xs text-brand-600 hover:underline"
                            >
                              {showPages ? 'Hide pages' : 'View pages'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Pages list */}
                      {showPages && pagesList.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                          {pagesList.map((page, i) => (
                            <p key={i} className="text-xs text-gray-500 py-0.5 font-mono">{page}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error */}
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
                    {scanComplete && (
                      <span className="text-xs text-green-600 font-medium">✅ Auto-generated from {pagesScanned} pages</span>
                    )}
                  </div>
                  <Textarea
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    rows={7}
                    placeholder="You are a helpful assistant..."
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-gray-400">
                    {scanComplete
                      ? `Generated from ${pagesScanned} pages. You can edit this before creating.`
                      : 'Click "Scan Site" to auto-generate from your website, or write manually.'}
                  </p>
                </div>

                <Button type="submit" loading={creating} className="w-full" disabled={scanning}>
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
            <div className="text-center py-16 text-gray-400 text-sm">
              <p>No projects yet.</p>
              <p className="mt-1">Create your first project to get started.</p>
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
                          {project.system_prompt && project.system_prompt !== 'You are a helpful assistant.' && (
                            <p className="text-xs text-green-600 mt-0.5">✅ Custom AI trained</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
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
