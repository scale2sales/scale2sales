import type { Metadata } from 'next'
import { ChatbotTesterClient } from '@/components/tools/ChatbotTesterClient'

export const metadata: Metadata = {
  title: 'Free AI Chatbot Tester — Test Any Website Chatbot | Scale2Sales',
  description: 'Enter any website URL and instantly get a live AI chatbot trained on that website content. Free chatbot tester — no signup required.',
  keywords: 'ai chatbot tester, website chatbot, test chatbot, free chatbot, ai chat demo',
}

export default function ChatbotTesterPage() {
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
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
            🤖 Free Tool · No signup required
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            AI Chatbot Tester
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Enter any website URL below. We'll scan the site and instantly create a live AI chatbot trained on its content — completely free.
          </p>
        </div>

        <ChatbotTesterClient />
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Enter a URL', desc: 'Type in any website URL — yours or a competitor\'s.' },
            { step: '2', title: 'AI scans the site', desc: 'We read up to 15 pages and extract key information in seconds.' },
            { step: '3', title: 'Chat instantly', desc: 'Ask the chatbot anything about the website — it knows all the content.' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Want this chatbot on your website?
          </h2>
          <p className="text-gray-500 mb-6">
            Add a live AI chatbot to your website in 5 minutes. Free plan available — no credit card required.
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
