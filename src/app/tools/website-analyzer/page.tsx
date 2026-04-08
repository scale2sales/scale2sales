import type { Metadata } from 'next'
import { WebsiteAnalyzerClient } from '@/components/tools/WebsiteAnalyzerClient'

export const metadata: Metadata = {
  title: 'Free Website Content Analyzer — AI Analysis | Scale2Sales',
  description: 'Analyze any website with AI. Get instant insights on content quality, key topics, customer messaging, and how to improve conversions. Free tool.',
  keywords: 'website analyzer, website content analysis, ai website audit, website checker, content analyzer',
}

export default function WebsiteAnalyzerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900">Scale2Sales</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/tools" className="text-sm text-gray-500 hover:text-gray-700">← All tools</a>
            <a href="/signup" className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors">
              Create your chatbot →
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
            🔍 Free Tool · No signup required
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Website Content Analyzer
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Enter any website URL and get an instant AI-powered analysis — key topics, content quality, customer messaging gaps, and actionable improvements.
          </p>
        </div>

        <WebsiteAnalyzerClient />
      </div>

      {/* CTA */}
      <div className="bg-white border-t border-gray-100 py-12 mt-8">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Turn your website into a 24/7 sales machine
          </h2>
          <p className="text-gray-500 mb-6">
            Add an AI chatbot trained on your website content. Answers customer questions instantly, captures leads automatically.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors"
          >
            Start for free →
          </a>
        </div>
      </div>
    </div>
  )
}
