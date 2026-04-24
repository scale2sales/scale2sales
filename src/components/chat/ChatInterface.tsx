'use client'
// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ChatMessage {
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
    .replace(/`(.+?)`/g, '<code style="background:#f0f0f0;padding:1px 4px;border-radius:3px;font-size:11px">$1</code>')
    .replace(/^\s*[-•]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '<div style="margin:4px 0"></div>')
    .replace(/\n/g, ' ')
}

export function ChatInterface({ project, initialConversation, initialMessages, organizationId }: any) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.map((m: any) => ({ id: m.id, role: m.role, content: m.content }))
  )
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(initialConversation?.id ?? null)
  const [usageWarning, setUsageWarning] = useState<{ used: number; limit: number; percent: number } | null>(null)
  const [limitError, setLimitError] = useState<{ used: number; limit: number; plan: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setLimitError(null)

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const assistantMsgId = crypto.randomUUID()
    setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, projectId: project.id, conversationId, organizationId }),
      })

      // Handle usage limit error
      if (response.status === 429) {
        const data = await response.json()
        setMessages((prev) => prev.filter(m => m.id !== assistantMsgId))
        setLimitError({ used: data.used, limit: data.limit, plan: data.plan })
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        const err = await response.json()
        setMessages((prev) => prev.map(m => m.id === assistantMsgId ? { ...m, content: err.error || 'An error occurred.', isStreaming: false } : m))
        setIsLoading(false)
        return
      }

      const newConvId = response.headers.get('X-Conversation-Id')
      if (newConvId) setConversationId(newConvId)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
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
                  setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? { ...m, content: accumulated } : m))
                }
                // Show usage warning
                if (parsed.usageWarning) {
                  setUsageWarning({ used: parsed.used, limit: parsed.limit, percent: parsed.percent })
                }
              } catch {}
            }
          }
        }
      }
      setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
    } catch {
      setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? { ...m, content: 'An error occurred. Please try again.', isStreaming: false } : m))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200">
        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{project.name}</p>
          <p className="text-xs text-gray-500">AI Playground</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
          <span className="text-xs text-gray-500">Online</span>
        </div>
      </div>

      {/* Usage warning banner */}
      {usageWarning && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 flex items-center justify-between">
          <p className="text-xs text-yellow-800">
            ⚠️ You've used <strong>{usageWarning.used}/{usageWarning.limit}</strong> free messages this month ({usageWarning.percent}%)
          </p>
          <Link href="/dashboard/billing" className="text-xs font-semibold text-yellow-800 underline hover:text-yellow-900">
            Upgrade →
          </Link>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
            </div>
            <p className="text-gray-900 font-semibold text-lg">Start a conversation</p>
            <p className="text-gray-500 text-sm mt-1 max-w-sm">
              Send a message to test your AI chatbot for <strong>{project.name}</strong>
            </p>
          </div>
        )}
        {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}

        {/* Usage limit error */}
        {limitError && (
          <div className="mx-auto max-w-sm bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <p className="text-2xl mb-2">🚫</p>
            <p className="font-semibold text-red-800 mb-1">Monthly limit reached</p>
            <p className="text-sm text-red-600 mb-4">
              You've used all <strong>{limitError.limit}</strong> messages on the <strong>{limitError.plan}</strong> plan this month.
            </p>
            <Link
              href="/dashboard/billing"
              className="inline-block bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors"
            >
              Upgrade to continue →
            </Link>
            <p className="text-xs text-red-400 mt-2">Resets on the 1st of next month</p>
          </div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="px-4 py-4 bg-white border-t border-gray-200">
        {limitError ? (
          <div className="text-center py-2">
            <Link href="/dashboard/billing" className="text-sm text-brand-600 font-medium hover:underline">
              Upgrade your plan to send more messages →
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize() }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none min-h-[24px]"
                style={{ maxHeight: '200px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className={cn(
                  'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                  input.trim() && !isLoading ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                {isLoading ? (
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
            <p className="text-center text-xs text-gray-400 mt-2">AI can make mistakes. Verify important information.</p>
          </>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
        </div>
      )}
      <div className={cn(
        'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm',
        isUser ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
      )}>
        {isUser ? (
          <span style={{ lineHeight: '1.5' }}>{message.content}</span>
        ) : message.content ? (
          <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
            <style>{`
              .ai-msg ul { margin: 4px 0; padding-left: 16px; list-style: disc; }
              .ai-msg li { margin: 2px 0; }
              .ai-msg h2, .ai-msg h3 { margin: 6px 0 2px; }
              .ai-msg strong { font-weight: 600; }
            `}</style>
            <div className="ai-msg" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}/>
          </div>
        ) : (
          <span className="flex gap-1 items-center h-5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}/>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}/>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}/>
          </span>
        )}
        {message.isStreaming && message.content && (
          <span className="inline-block w-0.5 h-3 bg-gray-400 ml-0.5 animate-pulse align-middle"/>
        )}
      </div>
    </div>
  )
}
