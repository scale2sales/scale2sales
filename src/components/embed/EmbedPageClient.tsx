'use client'
// @ts-nocheck
import { useState } from 'react'
import Link from 'next/link'

export function EmbedPageClient({ project, userEmail }: { project: any; userEmail?: string }) {
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [widgetName, setWidgetName] = useState(project.name + ' Assistant')
  const [greeting, setGreeting] = useState('Hi! How can I help you today?')
  const [position, setPosition] = useState('right')
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [activeTab, setActiveTab] = useState<'embed' | 'share'>('share')

  const appUrl = 'https://scale2sales.com'
  const shareUrl = `${appUrl}/chat/${project.id}`

  const embedCode = `<!-- Scale2Sales AI Chatbot -->
<script>
  window.Scale2SalesConfig = {
    projectId: "${project.id}",
    appUrl: "${appUrl}",
    primaryColor: "${primaryColor}",
    widgetName: "${widgetName}",
    greeting: "${greeting}",
    position: "${position}"
  };
</script>
<script src="${appUrl}/widget.js" async></script>`

  function copyEmbed() {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyShareLink() {
    navigator.clipboard.writeText(shareUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  async function sendEmailCode() {
    setSendingEmail(true)
    try {
      await fetch('/api/send-embed-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          projectName: project.name,
          embedCode,
          shareUrl,
          projectId: project.id,
        }),
      })
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 4000)
    } catch {
      alert('Failed to send email. Please try again.')
    }
    setSendingEmail(false)
  }

  const platforms = [
    { name: 'WordPress', icon: '🔵', steps: 'Appearance → Theme Editor → footer.php → paste before </body>' },
    { name: 'Shopify', icon: '🟢', steps: 'Online Store → Themes → Edit code → theme.liquid → paste before </body>' },
    { name: 'Webflow', icon: '🔷', steps: 'Project Settings → Custom Code → Footer Code → paste code' },
    { name: 'Wix', icon: '⬛', steps: 'Settings → Custom Code → Add Code → Body → paste code' },
    { name: 'Squarespace', icon: '⬜', steps: 'Settings → Advanced → Code Injection → Footer → paste code' },
    { name: 'GoDaddy', icon: '🟡', steps: 'Website → Edit Site → Pages → SEO → Footer Code → paste code' },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/projects`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to projects
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Add to your website</h1>
        <p className="text-gray-500 mt-1">Choose the easiest way to get your chatbot live</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('share')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'share' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔗 Share Link
          <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Easiest</span>
        </button>
        <button
          onClick={() => setActiveTab('embed')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'embed' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {'<>'} Embed Code
        </button>
      </div>

      {/* Share Link Tab */}
      {activeTab === 'share' && (
        <div className="space-y-6">
          {/* Share link card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-1">Your chatbot share link</h2>
            <p className="text-sm text-gray-500 mb-4">
              Share this link anywhere — no website editing needed! Works on social media, email, WhatsApp, anywhere.
            </p>

            {/* Link display */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand-600 font-mono truncate">
                {shareUrl}
              </div>
              <button
                onClick={copyShareLink}
                className="px-5 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors flex items-center gap-2"
              >
                {linkCopied ? '✅ Copied!' : '📋 Copy link'}
              </button>
            </div>

            {/* Open link */}
            <div className="flex gap-3">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Preview chatbot
              </a>
            </div>
          </div>

          {/* Where to share */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Where to share your link</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { icon: '📧', title: 'Email signature', desc: 'Add "Chat with our AI →" to your email signature' },
                { icon: '📱', title: 'Instagram bio', desc: 'Put the link in your Instagram or TikTok bio' },
                { icon: '💼', title: 'LinkedIn profile', desc: 'Add to your LinkedIn featured section' },
                { icon: '🗺️', title: 'Google Business', desc: 'Add to your Google Business Profile website field' },
                { icon: '💬', title: 'WhatsApp/SMS', desc: 'Share directly with customers who message you' },
                { icon: '🖨️', title: 'Business cards', desc: 'Print as QR code on business cards or flyers' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code hint */}
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-3xl">📱</span>
            <div className="flex-1">
              <p className="font-semibold text-brand-900">Generate a QR code for free</p>
              <p className="text-sm text-brand-700 mt-0.5">
                Go to{' '}
                <a href="https://qr-code-generator.com" target="_blank" rel="noopener noreferrer" className="underline">
                  qr-code-generator.com
                </a>
                {' '}→ paste your share link → download QR code → print on menus, cards, or posters.
              </p>
            </div>
          </div>

          {/* Still want to embed */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Want to embed the chatbot directly on your website instead?{' '}
              <button onClick={() => setActiveTab('embed')} className="text-brand-600 hover:underline font-medium">
                Get the embed code →
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Embed Code Tab */}
      {activeTab === 'embed' && (
        <div className="space-y-6">
          {/* Customize */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Customize your widget</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Widget name</label>
                <input
                  type="text"
                  value={widgetName}
                  onChange={e => setWidgetName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Greeting message</label>
                <input
                  type="text"
                  value={greeting}
                  onChange={e => setGreeting(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="right">Bottom right</option>
                  <option value="left">Bottom left</option>
                </select>
              </div>
            </div>
          </div>

          {/* Code snippet */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Your embed code</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyEmbed}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
                >
                  {copied ? '✅ Copied!' : '📋 Copy code'}
                </button>
                <button
                  onClick={sendEmailCode}
                  disabled={sendingEmail || emailSent}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {emailSent ? '✅ Sent!' : sendingEmail ? 'Sending...' : '📧 Email me the code'}
                </button>
              </div>
            </div>
            <pre className="bg-gray-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed">
              {embedCode}
            </pre>
            {emailSent && (
              <p className="text-sm text-green-600 mt-2">
                Code sent to {userEmail}! Forward it to your web developer.
              </p>
            )}
          </div>

          {/* Platform guides */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">How to add to your website</h2>
            <div className="space-y-3">
              {platforms.map(platform => (
                <div key={platform.name} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <span className="text-xl flex-shrink-0">{platform.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{platform.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{platform.steps}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-medium text-yellow-800">
                Not sure how to do this?
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Use the <button onClick={() => setActiveTab('share')} className="underline font-medium">Share Link</button> instead — no code needed! Or email the code to your web developer.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
