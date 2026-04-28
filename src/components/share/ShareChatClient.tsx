'use client'
// @ts-nocheck
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

function renderMarkdown(text: string): string {
  if (!text) return ''
  return text
    .replace(/^## (.+)$/gm, '<h2 style="font-size:14px;font-weight:700;margin:8px 0 3px;color:#111">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:600;margin:6px 0 2px;color:#111">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\s*[-•]\s+(.+)$/gm, '<li style="margin:2px 0">$1</li>')
    .replace(/(<li[^>]*>[\s\S]+?<\/li>\s*)+/gm, (m) => `<ul style="margin:4px 0;padding-left:16px;list-style:disc">${m}</ul>`)
    .replace(/\n\n/g, '<div style="margin:4px 0"></div>')
    .replace(/\n/g, ' ')
}

export function ShareChatClient({ project }: { project: any }) {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: `Hi! I'm the **${project.name}** AI assistant. Ask me anything about ${project.website_url ? new URL(project.website_url).hostname : project.name}!`,
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const text = input.trim()
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const assistantId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', isStreaming: true }])

    try {
      const res = await fetch('/api/tools/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          systemPrompt: project.system_prompt || `You are a helpful AI assistant for ${project.name}. Answer questions about the business helpfully and accurately.`,
        }),
      })

      if (!res.ok) throw new Error('Failed')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          for (const line of decoder.decode(value, { stream: true }).split('\n')) {
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
      }
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m))
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: 'Sorry, something went wrong. Please try again.', isStreaming: false } : m
      ))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{project.name} AI Assistant</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
            <span className="text-xs text-gray-500">Online · replies instantly</span>
          </div>
        </div>
        {project.website_url && (
          <a
            href={project.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-600 hover:underline hidden sm:block"
          >
            Visit website →
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-brand-600 text-white rounded-br-sm'
                : 'bg-white border border-gray-100 shadow-sm rounded-bl-sm text-gray-800'
            }`}>
              {msg.role === 'user' ? (
                <span style={{ lineHeight: '1.5' }}>{msg.content}</span>
              ) : msg.content ? (
                <div
                  style={{ fontSize: '13px', lineHeight: '1.6' }}
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

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              )}
            </button>
          </div>
          {/* Powered by */}
          <p className="text-center text-xs text-gray-400 mt-2">
            Powered by{' '}
            <Link href="https://scale2sales.com" className="text-brand-500 hover:underline font-medium">
              Scale2Sales
            </Link>
            {' '}·{' '}
            <Link href="https://scale2sales.com/signup" className="text-brand-500 hover:underline">
              Add AI to your website →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
