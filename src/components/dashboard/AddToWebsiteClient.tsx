'use client'
// @ts-nocheck
import { useState } from 'react'
import Link from 'next/link'

export function AddToWebsiteClient({ projects, userEmail }: { projects: any[]; userEmail?: string }) {
  const [selectedProject, setSelectedProject] = useState(projects[0] || null)
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [widgetName, setWidgetName] = useState(projects[0]?.name + ' Assistant' || 'AI Assistant')
  const [greeting, setGreeting] = useState('Hi! How can I help you today?')
  const [position, setPosition] = useState('right')
  const [activeTab, setActiveTab] = useState<'share' | 'wordpress' | 'embed'>('share')
  const [linkCopied, setLinkCopied] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [idCopied, setIdCopied] = useState(false)

  const appUrl = 'https://scale2sales.com'
  const shareUrl = selectedProject ? `${appUrl}/chat/${selectedProject.id}` : ''

  const embedCode = selectedProject ? `<!-- Scale2Sales AI Chatbot -->
<script>
  window.Scale2SalesConfig = {
    projectId: "${selectedProject.id}",
    appUrl: "${appUrl}",
    primaryColor: "${primaryColor}",
    widgetName: "${widgetName}",
    greeting: "${greeting}",
    position: "${position}"
  };
</script>
<script src="${appUrl}/widget.js" async></script>` : ''

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  function copyCode() {
    navigator.clipboard.writeText(embedCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  function copyId() {
    if (selectedProject) navigator.clipboard.writeText(selectedProject.id)
    setIdCopied(true)
    setTimeout(() => setIdCopied(false), 2000)
  }

  async function sendEmail() {
    setSendingEmail(true)
    try {
      await fetch('/api/send-embed-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          projectName: selectedProject?.name,
          embedCode,
          shareUrl,
          projectId: selectedProject?.id,
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
    { name: 'WordPress', icon: '🔵', steps: 'Appearance -> Theme Editor -> footer.php -> paste before closing body tag. Or use our WordPress plugin!' },
    { name: 'Shopify', icon: '🟢', steps: 'Online Store -> Themes -> Edit code -> theme.liquid -> paste before closing body tag' },
    { name: 'Webflow', icon: '🔷', steps: 'Project Settings -> Custom Code -> Footer Code -> paste code -> Publish' },
    { name: 'Wix', icon: '⬛', steps: 'Settings -> Custom Code -> Add Code -> Body -> paste code -> Apply' },
    { name: 'Squarespace', icon: '⬜', steps: 'Settings -> Advanced -> Code Injection -> Footer -> paste code -> Save' },
    { name: 'GoDaddy', icon: '🟡', steps: 'Website -> Edit Site -> Pages -> SEO -> Footer Code -> paste code' },
  ]

  if (projects.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-16">
        <p className="text-5xl mb-4">🤖</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">No projects yet</h1>
        <p className="text-gray-500 mb-6">Create a project first, then come back to add it to your website.</p>
        <Link href="/dashboard/projects" className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors">
          Create your first project
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add to your website</h1>
        <p className="text-gray-500 mt-1">Choose your chatbot and the easiest way to go live</p>
      </div>

      {/* Project selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Step 1 — Choose your chatbot</h2>
        {projects.length === 1 ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 border border-brand-200">
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{projects[0].name}</p>
              {projects[0].website_url && <p className="text-xs text-gray-500">{projects[0].website_url}</p>}
            </div>
            <span className="ml-auto text-xs text-green-600 font-medium">Selected</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProject(p)
                  setWidgetName(p.name + ' Assistant')
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedProject?.id === p.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedProject?.id === p.id ? 'bg-brand-600' : 'bg-gray-200'
                }`}>
                  <svg className={`w-5 h-5 ${selectedProject?.id === p.id ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.name}</p>
                  {p.website_url && <p className="text-xs text-gray-400 truncate">{p.website_url}</p>}
                </div>
                {selectedProject?.id === p.id && (
                  <span className="ml-auto text-xs text-brand-600 font-medium flex-shrink-0">Selected</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2 — Method tabs */}
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Step 2 — Choose how to add it</h2>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('share')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'share' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🔗 Share Link
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Easiest</span>
          </button>
          <button
            onClick={() => setActiveTab('wordpress')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'wordpress' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🔵 WordPress Plugin
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'embed' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Embed Code
          </button>
        </div>
      </div>

      {/* Share Link Tab */}
      {activeTab === 'share' && selectedProject && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-1">Your chatbot share link</h3>
            <p className="text-sm text-gray-500 mb-4">Share this link anywhere -- no website editing needed!</p>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand-600 font-mono truncate">
                {shareUrl}
              </div>
              <button onClick={copyLink}
                className="px-5 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
                {linkCopied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              Preview chatbot
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Where to share</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { icon: '📧', title: 'Email signature', desc: 'Add "Chat with our AI" to your email signature' },
                { icon: '📱', title: 'Instagram / TikTok bio', desc: 'Put the link in your bio' },
                { icon: '💼', title: 'LinkedIn profile', desc: 'Add to your featured section' },
                { icon: '🗺️', title: 'Google Business Profile', desc: 'Add to your website field' },
                { icon: '💬', title: 'WhatsApp / SMS', desc: 'Share directly with customers' },
                { icon: '🖨️', title: 'Business cards', desc: 'Print as QR code on cards or flyers' },
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

          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-3xl">📱</span>
            <div>
              <p className="font-semibold text-brand-900">Generate a free QR code</p>
              <p className="text-sm text-brand-700 mt-0.5">
                Go to{' '}
                <a href="https://qr-code-generator.com" target="_blank" rel="noopener noreferrer" className="underline">qr-code-generator.com</a>
                {' '} -- paste your link -- download and print!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WordPress Tab */}
      {activeTab === 'wordpress' && selectedProject && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-1">WordPress Plugin</h3>
            <p className="text-sm text-gray-500 mb-6">Install in 2 minutes -- no coding required.</p>
            <div className="space-y-4 mb-6">
              {[
                { step: '1', title: 'Download the plugin', desc: 'Click the download button below.' },
                { step: '2', title: 'Upload to WordPress', desc: 'Go to Plugins -> Add New -> Upload Plugin -> choose the zip file -> Install Now -> Activate.' },
                { step: '3', title: 'Enter your Project ID', desc: 'Go to Settings -> Scale2Sales -> paste your Project ID -> Save.' },
                { step: '4', title: 'Done! Your chatbot is live.', desc: 'The chatbot appears on every page automatically.' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{item.step}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
              <p className="text-xs text-gray-500 mb-1">Your Project ID (needed in Step 3):</p>
              <div className="flex items-center gap-3">
                <p className="text-sm font-mono font-bold text-brand-600 flex-1 truncate">{selectedProject.id}</p>
                <button onClick={copyId}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
                  {idCopied ? 'Copied!' : 'Copy ID'}
                </button>
              </div>
            </div>
            <a href="/scale2sales-chatbot.zip" download
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download WordPress Plugin
            </a>
          </div>
        </div>
      )}

      {/* Embed Code Tab */}
      {activeTab === 'embed' && selectedProject && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Customize your widget</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Widget name</label>
                <input type="text" value={widgetName} onChange={e => setWidgetName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand color</label>
                <div className="flex gap-2">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"/>
                  <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Greeting message</label>
                <input type="text" value={greeting} onChange={e => setGreeting(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select value={position} onChange={e => setPosition(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="right">Bottom right</option>
                  <option value="left">Bottom left</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Your embed code</h3>
              <div className="flex gap-2">
                <button onClick={copyCode}
                  className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
                  {codeCopied ? 'Copied!' : 'Copy code'}
                </button>
                <button onClick={sendEmail} disabled={sendingEmail || emailSent}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  {emailSent ? 'Sent!' : sendingEmail ? 'Sending...' : 'Email me the code'}
                </button>
              </div>
            </div>
            <pre className="bg-gray-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {embedCode}
            </pre>
            {emailSent && (
              <p className="text-sm text-green-600 mt-2">Code sent to {userEmail}! Forward it to your web developer.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">How to add to popular platforms</h3>
            <div className="space-y-3">
              {platforms.map(p => (
                <div key={p.name} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <span className="text-xl flex-shrink-0">{p.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.steps}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-medium text-yellow-800">Not sure how to do this?</p>
              <p className="text-xs text-yellow-700 mt-1">
                Use the{' '}
                <button onClick={() => setActiveTab('share')} className="underline font-medium">Share Link</button>
                {' '}instead -- no code needed! Or{' '}
                <button onClick={() => setActiveTab('wordpress')} className="underline font-medium">install our WordPress plugin</button>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
