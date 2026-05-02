'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createProject } from '@/lib/actions/projects'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [description, setDescription] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
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

  // Validation state
  const [showScanWarning, setShowScanWarning] = useState(false)
  const [urlWhenWarningShown, setUrlWhenWarningShown] = useState('')

  useEffect(() => {
    fetch('/api/projects/list')
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
  }, [])

  // Reset scan when URL changes
  useEffect(() => {
    if (scanComplete && websiteUrl !== urlWhenWarningShown) {
      setScanComplete(false)
      setSystemPrompt('')
      setPagesScanned(0)
      setPagesList([])
    }
    // Hide warning if they removed the URL
    if (!websiteUrl) setShowScanWarning(false)
  }, [websiteUrl])

  async function handleScan() {
    if (!websiteUrl.trim()) {
      setScanError('Please enter a website URL first')
      return
    }

    setScanning(true)
    setScanError('')
    setScanComplete(false)
    setShowScanWarning(false)
    setScanProgress(0)
    setScanMessage('Starting scan...')
    setPagesScanned(0)
    setPagesList([])

    let normalizedUrl = websiteUrl.trim()
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, maxPages: 15 }),
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
                setUrlWhenWarningShown(websiteUrl)
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
    } catch {
      setScanError('Failed to connect. Please try again.')
      setScanning(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()

    // Validation: if URL entered but not scanned, show warning
    if (websiteUrl.trim() && !scanComplete) {
      setShowScanWarning(true)
      return
    }

    setCreating(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('website_url', websiteUrl)
    formData.append('description', description)
    formData.append('system_prompt', systemPrompt || 'You are a helpful assistant.')
    await createProject(formData)
  }



  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-500 mt-1">Each project is a chatbot for one of your products or websites</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create form */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Create new project</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <form onSubmit={handleCreate} className="space-y-4">

              {/* Project name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project name *</label>
                <input
                  type="text"
                  placeholder="My Website Bot"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Website URL + Scan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                  <span className="text-gray-400 font-normal ml-1">(recommended)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://mysite.com"
                    value={websiteUrl}
                    onChange={e => {
                      setWebsiteUrl(e.target.value)
                      setScanComplete(false)
                      setScanError('')
                      setShowScanWarning(false)
                    }}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      showScanWarning ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleScan}
                    disabled={scanning || !websiteUrl.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 text-sm font-medium hover:bg-brand-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {scanning ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Scanning...
                      </>
                    ) : scanComplete ? (
                      '🔄 Re-scan'
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

                {/* Scan warning */}
                {showScanWarning && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">⚠️</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-800">
                          Please scan your website before creating
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Scanning trains your chatbot on your business content. Without it, your chatbot cannot answer customer questions about your business.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={handleScan}
                            className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-xs font-semibold hover:bg-yellow-700 transition-colors"
                          >
                            Scan my website now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                {(scanning || scanComplete) && !scanError && !showScanWarning && (
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
                    {showPages && pagesList.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {pagesList.map((page, i) => (
                          <p key={i} className="text-xs text-gray-500 py-0.5 font-mono">{page}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Scan error */}
                {scanError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg mt-1">
                    {scanError}
                  </div>
                )}

                {/* Success */}
                {scanComplete && !showScanWarning && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    <span>✅</span>
                    <span>
                      Scanned <strong>{pagesScanned} pages</strong> — your chatbot is trained and ready!
                    </span>
                  </div>
                )}
              </div>

              {/* System prompt (hidden behind friendly label) */}
              {scanComplete && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      What your chatbot knows
                    </label>
                    <span className="text-xs text-green-600 font-medium">Auto-generated from {pagesScanned} pages</span>
                  </div>
                  <textarea
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    rows={6}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-600 bg-gray-50"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    You can edit this to add more details about your business.
                  </p>
                </div>
              )}

              {/* Create button */}
              <button
                type="submit"
                disabled={creating || scanning || !name.trim()}
                className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating...' : 'Create project'}
              </button>

              {/* Tip */}
              {!websiteUrl && !scanComplete && (
                <p className="text-xs text-gray-400 text-center">
                  💡 Tip: Enter your website URL and click "Scan Site" to automatically train your chatbot
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Project list */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Your projects ({projects.length})
          </h2>
          {projects.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
              <p className="text-4xl mb-3">🤖</p>
              <p className="font-medium text-gray-500">No projects yet</p>
              <p className="text-sm mt-1">Create your first chatbot to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}/chat`}>
                  <div className="bg-white rounded-2xl border border-gray-200 hover:border-brand-200 hover:shadow-md transition-all cursor-pointer p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{project.name}</p>
                        {project.website_url && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{project.website_url}</p>
                        )}
                        {project.system_prompt && project.system_prompt !== 'You are a helpful assistant.' ? (
                          <span className="inline-block mt-1 text-xs text-green-600 font-medium">✅ Trained on website</span>
                        ) : (
                          <span className="inline-block mt-1 text-xs text-yellow-600 font-medium">⚠️ Not trained yet</span>
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
