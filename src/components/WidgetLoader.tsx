'use client'

import { useEffect } from 'react'

export function WidgetLoader() {
  useEffect(() => {
    // Only load after React has fully hydrated
    (window as any).Scale2SalesConfig = {
      projectId: '31dadbeb-d706-49f0-8880-4565b614c2aa',
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


