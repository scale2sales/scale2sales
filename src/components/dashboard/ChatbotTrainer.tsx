'use client'
// @ts-nocheck
import { useState } from 'react'

interface TrainingData {
  businessDescription: string
  services: string
  hours: string
  location: string
  phone: string
  email: string
  faqs: string
  noAnswerResponse: string
  tone: string
}

export function ChatbotTrainer({ 
  projectId, 
  initialPrompt,
  onSave 
}: { 
  projectId: string
  initialPrompt?: string
  onSave?: (prompt: string) => void 
}) {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [data, setData] = useState<TrainingData>({
    businessDescription: '',
    services: '',
    hours: '',
    location: '',
    phone: '',
    email: '',
    faqs: '',
    noAnswerResponse: 'Please contact us directly and we will be happy to help.',
    tone: 'friendly',
  })
  const [advancedPrompt, setAdvancedPrompt] = useState(initialPrompt || '')

  function buildPromptFromData(d: TrainingData): string {
    const parts = []

    if (d.businessDescription) {
      parts.push(`About this business: ${d.businessDescription}`)
    }
    if (d.services) {
      parts.push(`Services and products offered: ${d.services}`)
    }
    if (d.hours) {
      parts.push(`Business hours: ${d.hours}`)
    }
    if (d.location) {
      parts.push(`Location: ${d.location}`)
    }
    if (d.phone) {
      parts.push(`Phone number: ${d.phone}`)
    }
    if (d.email) {
      parts.push(`Email address: ${d.email}`)
    }
    if (d.faqs) {
      parts.push(`Common questions and answers:\n${d.faqs}`)
    }

    const toneMap: Record<string, string> = {
      friendly: 'Be warm, friendly, and conversational.',
      professional: 'Be professional, formal, and concise.',
      casual: 'Be casual, relaxed, and approachable.',
    }

    parts.push(toneMap[d.tone] || toneMap.friendly)
    parts.push(`If you do not know the answer, say: "${d.noAnswerResponse}"`)
    parts.push('Always be helpful and accurate. Never make up information.')

    return parts.join('\n\n')
  }

  async function handleSave() {
    setSaving(true)
    const prompt = mode === 'simple' ? buildPromptFromData(data) : advancedPrompt

    try {
      const res = await fetch(`/api/projects/${projectId}/update-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt: prompt }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        if (onSave) onSave(prompt)
      }
    } catch {
      alert('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  const fields = [
    { key: 'businessDescription', label: 'What does your business do?', placeholder: 'e.g. We are a family-owned Italian restaurant in Atlanta serving authentic pizza and pasta since 1995.', multiline: true, required: true },
    { key: 'services', label: 'What products or services do you offer?', placeholder: 'e.g. Dine-in, takeout, catering. Menu includes pizza, pasta, salads, desserts. Prices range from $12-$28.', multiline: true, required: true },
    { key: 'hours', label: 'What are your business hours?', placeholder: 'e.g. Mon-Thu 11am-9pm, Fri-Sat 11am-10pm, Sunday 12pm-8pm', multiline: false, required: false },
    { key: 'location', label: 'Where are you located?', placeholder: 'e.g. 123 Main Street, Atlanta, GA 30301', multiline: false, required: false },
    { key: 'phone', label: 'Phone number', placeholder: 'e.g. (404) 555-1234', multiline: false, required: false },
    { key: 'email', label: 'Email address', placeholder: 'e.g. hello@mybusiness.com', multiline: false, required: false },
    { key: 'faqs', label: 'Common questions your customers ask', placeholder: 'Q: Do you offer delivery?\nA: Yes, we deliver within 5 miles via DoorDash.\n\nQ: Do you take reservations?\nA: Yes, call us or book online at our website.', multiline: true, required: false },
    { key: 'noAnswerResponse', label: 'What should the chatbot say when it does not know the answer?', placeholder: 'Please contact us directly and we will be happy to help.', multiline: false, required: false },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">Train your chatbot</h2>
          <p className="text-xs text-gray-500 mt-0.5">Tell us about your business so the AI can answer customer questions accurately</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('simple')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'simple' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
          >
            Simple
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'advanced' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
          >
            Advanced
          </button>
        </div>
      </div>

      <div className="p-6">
        {mode === 'simple' ? (
          <div className="space-y-5">
            {/* Tone selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What tone should your chatbot use?
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'friendly', label: 'Friendly', emoji: '😊' },
                  { value: 'professional', label: 'Professional', emoji: '💼' },
                  { value: 'casual', label: 'Casual', emoji: '👋' },
                ].map(tone => (
                  <button
                    key={tone.value}
                    onClick={() => setData(d => ({ ...d, tone: tone.value }))}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      data.tone === tone.value
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {tone.emoji} {tone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            {fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.multiline ? (
                  <textarea
                    value={data[field.key as keyof TrainingData]}
                    onChange={e => setData(d => ({ ...d, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={field.key === 'faqs' ? 5 : 3}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-gray-700 placeholder:text-gray-400"
                  />
                ) : (
                  <input
                    type="text"
                    value={data[field.key as keyof TrainingData]}
                    onChange={e => setData(d => ({ ...d, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700 placeholder:text-gray-400"
                  />
                )}
              </div>
            ))}

            {/* Preview */}
            {(data.businessDescription || data.services) && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preview — What your chatbot knows</p>
                <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {buildPromptFromData(data).slice(0, 300)}...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">
              Write a custom system prompt for full control over your chatbot behavior.
            </p>
            <textarea
              value={advancedPrompt}
              onChange={e => setAdvancedPrompt(e.target.value)}
              rows={12}
              placeholder="You are a helpful assistant for [Business Name]..."
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || (mode === 'simple' && !data.businessDescription)}
            className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save and train chatbot'}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              Your chatbot has been updated!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
