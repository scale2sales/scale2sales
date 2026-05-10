// @ts-nocheck
import type { Metadata } from 'next'
import './globals.css'
import { CookieBanner } from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: {
    default: 'Scale2Sales — AI Chatbot for Your Website in 5 Minutes',
    template: '%s | Scale2Sales',
  },
  description: 'Add an AI chatbot trained on your website to capture leads, answer questions 24/7, and convert visitors into customers. No coding required.',
  keywords: 'ai chatbot, website chatbot, lead generation, customer support ai',
  openGraph: {
    title: 'Scale2Sales — AI Chatbot for Your Website',
    description: 'Add an AI chatbot trained on your website in 5 minutes. No coding required.',
    url: 'https://scale2sales.com',
    siteName: 'Scale2Sales',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scale2Sales — AI Chatbot for Your Website',
    description: 'Add an AI chatbot trained on your website in 5 minutes.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
        <CookieBanner />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.Scale2SalesConfig = {
                projectId: "d5507f3c-29e6-4b11-b19b-d1e05e0227a1",
                appUrl: "https://scale2sales.com",
                primaryColor: "#6366f1",
                widgetName: "Scale2Sales Support",
                greeting: "Hi! I can answer questions about Scale2Sales — pricing, features, how to get started. What would you like to know?",
                position: "right"
              };
            `,
          }}
        />
        <script src="https://scale2sales.com/widget.js" async />
      </body>
    </html>
  )
}
