'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'

const STEPS = [
  {
    id: 'create_project',
    title: 'Create your first project',
    description: 'A project is a chatbot for one of your websites or products.',
    cta: 'Create project',
    href: '/dashboard/projects',
    icon: '🚀',
  },
  {
    id: 'scan_website',
    title: 'Scan your website',
    description: 'Enter your website URL and let AI scan your content to train the chatbot.',
    cta: 'Go to projects',
    href: '/dashboard/projects',
    icon: '🔍',
  },
  {
    id: 'test_chat',
    title: 'Test your AI chatbot',
    description: 'Open the chat playground and ask your chatbot questions about your business.',
    cta: 'Go to projects',
    href: '/dashboard/projects',
    icon: '💬',
  },
  {
    id: 'get_embed_code',
    title: 'Get your embed code',
    description: 'Copy 2 lines of code and paste into your website to go live.',
    cta: 'Get embed code',
    href: '/dashboard/projects',
    icon: '</>', 
  },
  {
    id: 'upgrade_plan',
    title: 'Upgrade your plan',
    description: 'Get more messages, projects, and features with a paid plan.',
    cta: 'View plans',
    href: '/dashboard/billing',
    icon: '⭐',
  },
]

export function OnboardingChecklist({ completedSteps = [] }: { completedSteps?: string[] }) {
  const [completed, setCompleted] = useState<string[]>(completedSteps)
  const [dismissed, setDismissed] = useState(false)

  const completedCount = completed.length
  const totalCount = STEPS.length
  const percent = Math.round((completedCount / totalCount) * 100)
  const allDone = completedCount === totalCount

  function markComplete(stepId: string) {
    if (!completed.includes(stepId)) {
      setCompleted(prev => [...prev, stepId])
    }
  }

  if (dismissed) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {allDone ? '🎉 You\'re all set!' : 'Get started with Scale2Sales'}
            </p>
            <p className="text-xs text-gray-500">
              {completedCount} of {totalCount} steps completed
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600">{percent}%</span>
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-gray-50">
        {STEPS.map((step, index) => {
          const isDone = completed.includes(step.id)
          const isNext = !isDone && completed.length === index

          return (
            <div
              key={step.id}
              className={`px-6 py-4 flex items-center gap-4 transition-colors ${
                isNext ? 'bg-brand-50' : isDone ? 'bg-gray-50 opacity-75' : ''
              }`}
            >
              {/* Step number / check */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all ${
                isDone
                  ? 'bg-green-500 text-white'
                  : isNext
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{step.icon}</span>
                  <p className={`text-sm font-semibold ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {step.title}
                  </p>
                  {isNext && (
                    <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-medium">
                      Next
                    </span>
                  )}
                </div>
                {!isDone && (
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                )}
              </div>

              {/* CTA */}
              {!isDone && (
                <Link
                  href={step.href}
                  onClick={() => markComplete(step.id)}
                  className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                    isNext
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {step.cta} →
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {allDone && (
        <div className="px-6 py-4 bg-green-50 border-t border-green-100 text-center">
          <p className="text-sm font-semibold text-green-800">
            You have completed all steps! Your chatbot is ready to go live.
          </p>
          <button
            onClick={() => setDismissed(true)}
            className="mt-2 text-xs text-green-600 hover:underline"
          >
            Dismiss this checklist
          </button>
        </div>
      )}
    </div>
  )
}
