'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createProject } from '@/lib/actions/projects'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [creating, setCreating] = useState(false)

  // New project scan state
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanMessage, setScanMessage] = useState('')
  const [scanComplete, setScanComplete] = useState(false)
  const [scanError, setScanError] = useState('')
  const [pagesScanned, setPagesScanned] = useState(0)
  const [pagesList, setPagesList] = useState([])
  const [showPages, setShowPages] = useState(false)
  const [showScanWarning, setShowScanWarning] = useState(false)
  const [urlWhenWarningShown, setUrlWhenWarningShown] = useState('')

  // Train existing project state
  const [trainingProjectId, setTrainingProjectId] = useState(null)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [trainingMessage, setTrainingMessage] = useState('')
  const [trainingComplete, setTrainingComplete] = useState(null)

  // Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadProjects()
  }, [])

  function loadProjects() {
    fetch('/api/projects/list')
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
  }

  useEffect(() => {
    if (scanComplete && websiteUrl !== urlWhenWarningShown) {
      setScanComplete(false)
      setSystemPrompt('')
      setPagesScanned(0)
      setPagesList([])
    }
    if (!websiteUrl) setShowScanWarning(false)
  }, [websiteUrl])

  async function handleScan() {
    if (!websiteUrl.trim()) { setScanError('Please enter a website URL first'); return }
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
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'progress') { setScanProgress(data.progress); setScanMessage(data.message); if (data.pagesScanned) setPagesScanned(data.pagesScanned) }
              if (data.type === 'complete') { setScanProgress(100); setScanMessage(data.message); setPagesScanned(data.pagesScanned); setPagesList(data.pagesList || []); setSystemPrompt(data.systemPrompt); setScanComplete(true); setUrlWhenWarningShown(websiteUrl); setScanning(false) }
              if (data.type === 'error') { setScanError(data.message); setScanning(false) }
            } catch {}
          }
        }
      }
    } catch { setScanError('Failed to connect. Please try again.'); setScanning(false) }
  }

  async function handleTrainProject(project) {
    if (!project.website_url) { alert('This project has no website URL. Edit the project to add one first.'); return }
    setTrainingProjectId(project.id)
    setTrainingProgress(0)
    setTrainingMessage('Starting scan...')
    setTrainingComplete(null)

    let normalizedUrl = project.website_url.trim()
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, projectId: project.id, maxPages: 15 }),
      })
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'progress') { setTrainingProgress(data.progress); setTrainingMessage(data.message) }
              if (data.type === 'complete') {
                setTrainingProgress(100)
                setTrainingMessage('Training complete!')
                setTrainingComplete(project.id)
                setTrainingProjectId(null)
                // Update project in list
                setProjects(prev => prev.map(p => p.id === project.id ? { ...p, system_prompt: data.systemPrompt } : p))
                setTimeout(() => setTrainingComplete(null), 3000)
              }
              if (data.type === 'error') { setTrainingMessage(data.message); setTrainingProjectId(null) }
            } catch {}
          }
        }
      }
    } catch { setTrainingMessage('Failed to train. Please try again.'); setTrainingProjectId(null) }
  }

  async function handleDelete(projectId) {
    setDeletingId(projectId)
    try {
      const res = await fetch(`/api/projects/${projectId}/delete`, { method: 'DELETE' })
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
        setConfirmDeleteId(null)
      } else {
        alert('Failed to delete project. Please try again.')
      }
    } catch { alert('Failed to delete. Please try again.') }
    setDeletingId(null)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (websiteUrl.trim() && !scanComplete) { setShowScanWarning(true); return }
    setCreating(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('website_url', websiteUrl)
    formData.append('system_prompt', systemPrompt || 'You are a helpful assistant.')
    await createProject(formData)
  }

  const isTrained = (project) => project.system_prompt && project.system_prompt !== 'You are a helpful assistant.'

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-500 mt-1">Each project is a chatbot for one of your websites or products</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create form */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Create new project</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project name *</label>
                <input type="text" placeholder="My Website Bot" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL <span className="text-gray-400 font-normal">(recommended)</span>
                </label>
                <div className="flex gap-2">
                  <input type="text" placeholder="https://mysite.com" value={websiteUrl}
                    onChange={e => { setWebsiteUrl(e.target.value); setScanComplete(false); setScanError(''); setShowScanWarning(false) }}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${showScanWarning ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                  />
                  <button type="button" onClick={handleScan} disabled={scanning || !websiteUrl.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 text-sm font-medium hover:bg-brand-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                    {scanning ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Scanning...</>) : scanComplete ? '🔄 Re-scan' : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>Scan Site</>)}
                  </button>
                </div>

                {/* Scan warning */}
                {showScanWarning && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">⚠️</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-800">Please scan your website before creating</p>
                        <p className="text-xs text-yellow-700 mt-1">Scanning trains your chatbot on your business content. Without it, your chatbot cannot answer customer questions about your business.</p>
                        <button type="button" onClick={handleScan} className="mt-3 px-4 py-2 rounded-lg bg-yellow-600 text-white text-xs font-semibold hover:bg-yellow-700 transition-colors">
                          Scan my website now
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress */}
                {(scanning || scanComplete) && !scanError && !showScanWarning && (
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between"><p className="text-xs text-gray-600">{scanMessage}</p><p className="text-xs text-gray-400">{scanProgress}%</p></div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-brand-500 h-2 rounded-full transition-all duration-500" style={{ width: `${scanProgress}%` }}/></div>
                    {pagesScanned > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{scanComplete ? '✅' : '🔍'} {pagesScanned} page{pagesScanned !== 1 ? 's' : ''} scanned</p>
                        {scanComplete && pagesList.length > 0 && <button type="button" onClick={() => setShowPages(!showPages)} className="text-xs text-brand-600 hover:underline">{showPages ? 'Hide pages' : 'View pages'}</button>}
                      </div>
                    )}
                    {showPages && <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">{pagesList.map((page, i) => <p key={i} className="text-xs text-gray-500 py-0.5 font-mono">{page}</p>)}</div>}
                  </div>
                )}

                {scanError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg mt-1">{scanError}</div>}
                {scanComplete && !showScanWarning && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    <span>✅</span><span>Scanned <strong>{pagesScanned} pages</strong> — your chatbot is trained and ready!</span>
                  </div>
                )}
              </div>

              {scanComplete && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">What your chatbot knows</label>
                    <span className="text-xs text-green-600 font-medium">Auto-generated from {pagesScanned} pages</span>
                  </div>
                  <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={5}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-600 bg-gray-50"/>
                  <p className="text-xs text-gray-400 mt-1">You can edit this to add more details about your business.</p>
                </div>
              )}

              <button type="submit" disabled={creating || scanning || !name.trim()}
                className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {creating ? 'Creating...' : 'Create project'}
              </button>

              {!websiteUrl && !scanComplete && (
                <p className="text-xs text-gray-400 text-center">
                  💡 Enter your website URL and click "Scan Site" to automatically train your chatbot
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Project list */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Your projects ({projects.length})</h2>
          {projects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <p className="text-4xl mb-3">🤖</p>
              <p className="font-medium text-gray-500">No projects yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first chatbot to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all p-4">

                  {/* Training progress overlay */}
                  {trainingProjectId === project.id && (
                    <div className="mb-3 space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{trainingMessage}</span>
                        <span>{trainingProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-brand-500 h-2 rounded-full transition-all duration-500" style={{ width: `${trainingProgress}%` }}/>
                      </div>
                    </div>
                  )}

                  {/* Training complete */}
                  {trainingComplete === project.id && (
                    <div className="mb-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <span>✅</span><span>Training complete! Your chatbot is now ready.</span>
                    </div>
                  )}

                  {/* Delete confirmation */}
                  {confirmDeleteId === project.id && (
                    <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm font-semibold text-red-800 mb-1">Delete this project?</p>
                      <p className="text-xs text-red-600 mb-3">This will permanently delete the chatbot and all its conversations. This cannot be undone.</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(project.id)} disabled={deletingId === project.id}
                          className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
                          {deletingId === project.id ? 'Deleting...' : 'Yes, delete'}
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)}
                          className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Link href={`/dashboard/projects/${project.id}/chat`} className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{project.name}</p>
                      {project.website_url && <p className="text-xs text-gray-400 truncate mt-0.5">{project.website_url}</p>}
                      {isTrained(project) ? (
                        <span className="inline-block mt-1 text-xs text-green-600 font-medium">✅ Trained on website</span>
                      ) : (
                        <span className="inline-block mt-1 text-xs text-yellow-600 font-medium">⚠️ Not trained yet</span>
                      )}
                    </Link>

                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      {/* Train button for untrained projects */}
                      {!isTrained(project) && project.website_url && trainingProjectId !== project.id && (
                        <button onClick={() => handleTrainProject(project)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 font-medium hover:bg-yellow-100 transition-colors whitespace-nowrap">
                          Train now
                        </button>
                      )}

                      {/* Embed link */}
                      <Link href={`/dashboard/projects/${project.id}/embed`}
                        className="text-xs text-brand-600 hover:underline whitespace-nowrap">
                        Embed
                      </Link>

                      {/* Delete button */}
                      <button onClick={() => setConfirmDeleteId(confirmDeleteId === project.id ? null : project.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                        title="Delete project">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>

                      {/* Arrow */}
                      <Link href={`/dashboard/projects/${project.id}/chat`}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
