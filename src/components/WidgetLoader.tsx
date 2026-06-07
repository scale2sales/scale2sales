'use client'

import { useEffect } from 'react'

export function WidgetLoader() {
  useEffect(() => {
    // Only load after React has fully hydrated
    window.Scale2SalesConfig = {
      projectId: 'd5507f3c-29e6-4b11-b19b-d1e05e0227a1',
      appUrl: 'https://scale2sales.com',
      primaryColor: '#6366f1',
      widgetName: 'Scale2Sales Support',
      greeting: 'Hi! I can answer questions about Scale2Sales - pricing, features, how to get started. What would you like to know?',
      position: 'right',
    }

    const script = document.createElement('script')
    script.src = 'https://scale2sales.com/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount
      const existing = document.querySelector('script[src="https://scale2sales.com/widget.js"]')
      if (existing) existing.remove()
    }
  }, [])

  return null
}
