'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'

interface TopQuestion {
  question: string
  count: number
  lastAsked: string
}

export function TopQuestionsWidget({ organizationId }: { organizationId: string }) {
  const [questions, setQuestions] = useState<TopQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/top-questions?orgId=${organizationId}`)
      .then(r => r.json())
      .then(d => {
        setQuestions(d.questions || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [organizationId])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Top questions from visitors</h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Top questions from visitors</h2>
        <span className="text-xs text-gray-400">Last 30 days</span>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-3">💬</p>
          <p className="text-sm text-gray-500">No conversations yet.</p>
          <p className="text-xs text-gray-400 mt-1">Questions will appear here once visitors start chatting.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 font-medium truncate">{q.question}</p>
                <p className="text-xs text-gray-400 mt-0.5">Asked {q.count} time{q.count !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-brand-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min((q.count / (questions[0]?.count || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Use these insights to improve your chatbot answers
        </p>
      </div>
    </div>
  )
}
