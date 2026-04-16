'use client'
// @ts-nocheck
import { useState } from 'react'

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:700;margin:16px 0 6px;color:#111;border-bottom:1px solid #f0f0f0;padding-bottom:6px">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:600;margin:12px 0 4px;color:#374151">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#111">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\s*[-•]\s+(.+)$/gm, '<li style="margin:3px 0;color:#374151">$1</li>')
    .replace(/(<li[^>]*>[\s\S]+?<\/li>\s*)+/gm, (m) => `<ul style="margin:6px 0;padding-left:16px;list-style:disc">${m}</ul>`)
    .replace(/^\d+\.\s+(.+)$/gm, '<li style="margin:3px 0">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

const SCORE_COLORS = {
  high: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  low: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' },
}

export function WebsiteAnalyzerClient() {
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanMessage, setScanMessage] = useState('')
  const [scanError, setScanError] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [pagesScanned, setPagesScanned] = useState(0)

  async function handleAnalyze() {
    if (!url.trim()) return
    setScanning(true)
    setScanError('')
    setAnalysis(null)
    setScanProgress(0)
    setScanMessage('Starting analysis...')

    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl

    try {
      // Use the new tools-specific scrape endpoint (no auth needed)
      const res = await fetch('/api/tools/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let scrapedContent = ''
      let scrapedPages = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value, { stream: true }).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'progress') {
                setScanProgress(Math.min(data.progress * 0.7, 70))
                setScanMessage(data.message)
                if (data.pagesScanned) setPagesScanned(data.pagesScanned)
              }
              if (data.type === 'complete') {
                scrapedContent = data.systemPrompt
                scrapedPages = data.pagesScanned
                setPagesScanned(data.pagesScanned)
              }
              if (data.type === 'error') {
                setScanError(data.message)
                setScanning(false)
                return
              }
            } catch {}
          }
        }
      }

      if (!scrapedContent) {
        setScanError('Could not read website content. Please check the URL.')
        setScanning(false)
        return
      }

      // Now analyze with AI
      setScanMessage('Generating AI analysis...')
      setScanProgress(80)

      const aiRes = await fetch('/api/tools/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, content: scrapedContent, pagesScanned: scrapedPages }),
      })

      const aiData = await aiRes.json()
      if (aiData.error) {
        setScanError(aiData.error)
        setScanning(false)
        return
      }

      setScanProgress(100)
      setScanMessage('Analysis complete!')
      setAnalysis(aiData)
      setScanning(false)
    } catch (err) {
      setScanError('Failed to analyze. Please try again.')
      setScanning(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Enter your website URL</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !scanning && handleAnalyze()}
            placeholder="https://yourwebsite.com"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            disabled={scanning}
          />
          <button
            onClick={handleAnalyze}
            disabled={scanning || !url.trim()}
            className="px-6 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {scanning ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Analyzing…
              </>
            ) : analysis ? '🔄 Re-analyze' : '🔍 Analyze Website'}
          </button>
        </div>

        {scanning && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{scanMessage}</span>
              <span>{Math.round(scanProgress)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-brand-500 h-2 rounded-full transition-all duration-500" style={{ width: `${scanProgress}%` }}/>
            </div>
          </div>
        )}

        {scanError && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{scanError}</p>
        )}
      </div>

      {analysis && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {analysis.scores?.map((score) => {
              const level = score.value >= 70 ? 'high' : score.value >= 40 ? 'medium' : 'low'
              const colors = SCORE_COLORS[level]
              return (
                <div key={score.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
                  <p className="text-xs text-gray-500 mb-2">{score.label}</p>
                  <p className={`text-2xl font-bold ${colors.text}`}>{score.value}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div className={`${colors.bar} h-1.5 rounded-full`} style={{ width: `${score.value}%` }}/>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📊</span>
              <h2 className="text-base font-bold text-gray-900">Full Analysis</h2>
              <span className="ml-auto text-xs text-gray-400">{pagesScanned} pages analyzed</span>
            </div>
            <div
              style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis.fullAnalysis) }}
            />
          </div>

          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 text-center">
            <p className="font-semibold text-brand-900 mb-2">🚀 Fix these issues automatically with an AI chatbot</p>
            <p className="text-sm text-brand-700 mb-4">
              An AI chatbot trained on your website answers customer questions 24/7, fills content gaps, and captures leads automatically.
            </p>
            <a href="/signup" className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-700 transition-colors text-sm">
              Add chatbot to my website — free →
            </a>
          </div>
        </div>
      )}

      {!analysis && !scanning && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-medium text-gray-500">Enter a website URL above to analyze it</p>
          <p className="text-sm mt-1">Works on any website — yours, competitors, or any site you're curious about</p>
        </div>
      )}
    </div>
  )
}
