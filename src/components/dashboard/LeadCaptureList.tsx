'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'

interface Lead {
  email: string
  name?: string
  question: string
  projectName: string
  capturedAt: string
}

export function LeadCaptureList({ organizationId }: { organizationId: string }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/leads?orgId=${organizationId}`)
      .then(r => r.json())
      .then(d => {
        setLeads(d.leads || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [organizationId])

  function exportCSV() {
    const headers = ['Email', 'Name', 'First Question', 'Project', 'Date']
    const rows = leads.map(l => [
      l.email,
      l.name || '',
      l.question,
      l.projectName,
      new Date(l.capturedAt).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scale2sales-leads.csv'
    a.click()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Leads captured</h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Leads captured</h2>
          <p className="text-xs text-gray-400 mt-0.5">Visitors who shared their email via chatbot</p>
        </div>
        {leads.length > 0 && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export CSV
          </button>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-3">📧</p>
          <p className="text-sm text-gray-500 font-medium">No leads yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            To capture leads, add a question to your chatbot like "What is your email so we can follow up?"
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {leads.slice(0, 10).map((lead, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-brand-600">
                    {(lead.name || lead.email || '?')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {lead.name || lead.email}
                  </p>
                  {lead.name && (
                    <p className="text-xs text-gray-400 truncate">{lead.email}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">
                    {new Date(lead.capturedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-brand-600 truncate max-w-24">
                    {lead.projectName}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {leads.length > 10 && (
            <p className="text-xs text-gray-400 text-center mt-3">
              Showing 10 of {leads.length} leads. Export CSV to see all.
            </p>
          )}
        </>
      )}
    </div>
  )
}
