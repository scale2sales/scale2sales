'use client'
// @ts-nocheck
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export function EmbedCodeGenerator({ project, appUrl }: { project: any; appUrl: string }) {
  const [copied, setCopied] = useState(false)
  const [position, setPosition] = useState('bottom-right')
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [greeting, setGreeting] = useState(`Hi! I'm the ${project.name} assistant. How can I help you?`)

  const embedCode = `<!-- ${project.name} Chatbot Widget -->
<script>
  window.Scale2SalesConfig = {
    projectId: "${project.id}",
    appUrl: "${appUrl}",
    position: "${position}",
    primaryColor: "${primaryColor}",
    greeting: "${greeting}",
  };
</script>
<script src="${appUrl}/widget.js" async></script>`

  function copy() {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card className="border-brand-200">
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Preview</h2>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-100 rounded-xl h-64 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Your website content here
            </div>
            {/* Floating button preview */}
            <div className={`absolute ${position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'}`}>
              <div
                className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customization */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Customize</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Position</label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
                <span className="text-sm font-mono text-gray-600">{primaryColor}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Greeting Message</label>
            <input
              type="text"
              value={greeting}
              onChange={e => setGreeting(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Embed code */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Embed Code</h2>
            <button
              onClick={copy}
              className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
              }`}
            >
              {copied ? '✅ Copied!' : 'Copy Code'}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {embedCode}
          </pre>
          <p className="text-xs text-gray-500 mt-3">
            Paste this code just before the <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag on your website.
          </p>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Installation Steps</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { step: '1', text: 'Copy the embed code above' },
            { step: '2', text: 'Open your website\'s HTML file or CMS' },
            { step: '3', text: 'Paste the code just before the </body> tag' },
            { step: '4', text: 'Save and publish — your chatbot is live!' },
          ].map(item => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {item.step}
              </div>
              <p className="text-sm text-gray-700">{item.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
