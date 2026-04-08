'use client'
// @ts-nocheck
import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

function renderMarkdown(text: string): string {
  if (!text) return ''
  return text
    .replace(/^## (.+)$/gm, '<h2 style="font-size:13px;font-weight:700;margin:8px 0 3px;color:#111">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:12px;font-weight:600;margin:6px 0 2px;color:#111">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\s*[-•]\s+(.+)$/gm, '<li style="margin:1px 0">$1</li>')
    .replace(/(<li[^>]*>.*?<\/li>\s*)+/gm, (m) => `<ul style="margin:4px 0;padding-left:14px;list-style:disc">${m}</ul>`)
    .replace(/\n\n/g, '<br/>')
    .replace(/\n/g, ' ')
}

export function ChatbotTesterClient() {
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanMessage, setScanMessage] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [websiteReady, setWebsiteReady] = useState(false)
  const [scanError, setScanError] = useState('')
  const [pagesScanned, setPagesScanned] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [scannedUrl, setScannedUrl] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleScan() {
    if (!url.trim()) return
    setScanning(true)
    setScanError('')
    setWebsiteReady(false)
    setScanProgress(0)
    setScanMessage('Starting scan...')
    setMessages([])
    setSystemPrompt('')

    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, maxPages: 10 }),
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
                setSystemPrompt(data.systemPrompt)
                setPagesScanned(data.pagesScanned)
                setScannedUrl(normalizedUrl)
                setWebsiteReady(true)
                setScanning(false)
                setMessages([{
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: `Hi! I've just read **${data.pagesScanned} pages** from **${new URL(normalizedUrl).hostname}**. I'm ready to answer any questions about this website. What would you like to know?`,
                }])
                setTimeout(() => inputRef.current?.focus(), 100)
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
      setScanError('Failed to scan website. Please check the URL and try again.')
      setScanning(false)
    }
  }

  async function sendMessage() {
    if (!input.trim() || chatLoading || !systemPrompt) return

    const text = input.trim()
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setChatLoading(true)

    const assistantId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', isStreaming: true }])

    try {
      const res = await fetch('/api/tools/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, systemPrompt }),
      })

      if (!res.ok) throw new Error('Failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value, { stream: true }).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.delta) {
                accumulated += parsed.delta
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: accumulated } : m
                ))
              }
            } catch {}
          }
        }
      }
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m))
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: 'Sorry, something went wrong. Please try again.', isStreaming: false } : m
      ))
    }
    setChatLoading(false)
  }

  const suggestedQuestions = [
    'What services do you offer?',
    'What are your prices?',
    'How do I contact you?',
    'What makes you different?',
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* URL Input */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Enter any website URL to test
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !scanning && handleScan()}
            placeholder="https://yourwebsite.com"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            disabled={scanning}
          />
          <button
            onClick={handleScan}
            disabled={scanning || !url.trim()}
            className="px-6 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {scanning ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Scanning…
              </>
            ) : websiteReady ? '🔄 Re-scan' : '🚀 Scan & Chat'}
          </button>
        </div>

        {/* Progress */}
        {scanning && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{scanMessage}</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {scanError && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{scanError}</p>
        )}

        {websiteReady && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <span>✅</span>
            <span>Scanned <strong>{pagesScanned} pages</strong> from <strong>{new URL(scannedUrl).hostname}</strong> — chatbot is ready!</span>
          </div>
        )}
      </div>

      {/* Chat UI */}
      {websiteReady && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Chat header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{new URL(scannedUrl).hostname} AI Assistant</p>
              <p className="text-xs text-gray-400">Trained on {pagesScanned} pages · Free demo</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 shadow-sm rounded-bl-sm text-gray-800'
                }`}>
                  {msg.role === 'user' ? (
                    <span style={{ lineHeight: '1.5' }}>{msg.content}</span>
                  ) : msg.content ? (
                    <div
                      style={{ fontSize: '13px', lineHeight: '1.5' }}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                  ) : (
                    <span className="flex gap-1 items-center h-5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}/>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}/>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}/>
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-2">
              {suggestedQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); setTimeout(() => sendMessage(), 50) }}
                  className="text-xs px-3 py-1.5 rounded-full border border-brand-200 text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything about this website..."
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              disabled={chatLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || chatLoading}
              className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>

          {/* Powered by */}
          <div className="px-5 py-2 text-center text-xs text-gray-400 border-t border-gray-50">
            Powered by <a href="/signup" className="text-brand-500 hover:underline font-medium">Scale2Sales</a>
            {' '}·{' '}
            <a href="/signup" className="text-brand-500 hover:underline">Add this to your website →</a>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!websiteReady && !scanning && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">🤖</div>
          <p className="font-medium text-gray-500">Enter a website URL above to get started</p>
          <p className="text-sm mt-1">Try your own website, a competitor, or any site you're curious about</p>
        </div>
      )}
    </div>
  )
}
