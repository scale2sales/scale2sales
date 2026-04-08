import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Free AI Tools for Your Website | Scale2Sales',
  description: 'Free AI tools to help you add chatbots, analyze your website, and generate better customer responses. No signup required.',
}

const tools = [
  {
    href: '/tools/chatbot-tester',
    emoji: '🤖',
    title: 'AI Chatbot Tester',
    description: 'Enter any website URL and instantly get a live AI chatbot trained on that website. Test it in seconds — no signup needed.',
    badge: 'Most Popular',
    badgeColor: 'bg-brand-100 text-brand-700',
    tags: ['Free', 'No signup', 'Instant'],
  },
  {
    href: '/tools/website-analyzer',
    emoji: '🔍',
    title: 'Website Content Analyzer',
    description: 'Paste your website URL and get an AI-powered analysis of your content, key topics, and how to improve customer communication.',
    badge: 'New',
    badgeColor: 'bg-green-100 text-green-700',
    tags: ['Free', 'AI-powered', 'Instant'],
  },
  {
    href: '/tools/prompt-generator',
    emoji: '✍️',
    title: 'Chatbot Prompt Generator',
    description: 'Answer 5 quick questions about your business and get a perfect AI system prompt ready to use on your website.',
    badge: 'Coming soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    tags: ['Free', 'No signup'],
    disabled: true,
  },
  {
    href: '/tools/roi-calculator',
    emoji: '💰',
    title: 'Chatbot ROI Calculator',
    description: 'Enter your monthly website visitors and see exactly how much revenue a 24/7 AI chatbot could generate for your business.',
    badge: 'Coming soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    tags: ['Free', 'Calculator'],
    disabled: true,
  },
  {
    href: '/tools/faq-generator',
    emoji: '❓',
    title: 'AI FAQ Generator',
    description: 'Paste your website URL and automatically generate a complete FAQ page from your existing content.',
    badge: 'Coming soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    tags: ['Free', 'AI-powered'],
    disabled: true,
  },
  {
    href: '/tools/email-writer',
    emoji: '📧',
    title: 'Customer Reply Writer',
    description: 'Paste a customer complaint or question and get a professional, empathetic AI-written reply in seconds.',
    badge: 'Coming soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    tags: ['Free', 'AI-powered'],
    disabled: true,
  },
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Scale2Sales</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/tools" className="text-sm font-medium text-brand-600">Free Tools</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link href="/signup" className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>🛠️</span> Free AI Tools — No signup required
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Free AI tools for your website
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Test an AI chatbot on any website, analyze your content, and generate better customer responses — all free, no account needed.
        </p>
      </section>

      {/* Tools grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.href}>
              {tool.disabled ? (
                <div className="h-full p-6 rounded-2xl border border-gray-100 bg-gray-50 opacity-60">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{tool.emoji}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{tool.description}</p>
                </div>
              ) : (
                <Link href={tool.href} className="block h-full">
                  <div className="h-full p-6 rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer bg-white group">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{tool.emoji}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{tool.description}</p>
                    <div className="flex items-center gap-2">
                      {tool.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to add AI to your website?
          </h2>
          <p className="text-brand-200 mb-8 text-lg">
            Create your own AI chatbot trained on your website in 5 minutes. Free plan available.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors"
          >
            Start for free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-400">© 2025 Scale2Sales. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/tools" className="text-sm text-gray-400 hover:text-gray-600">Tools</Link>
            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">Login</Link>
            <Link href="/signup" className="text-sm text-gray-400 hover:text-gray-600">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
