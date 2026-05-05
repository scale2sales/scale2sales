import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">Scale2Sales</span>
        </div>

        {/* 404 */}
        <div className="mb-6">
          <h1 className="text-8xl font-bold text-brand-600 mb-2">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Oops! The page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
          >
            Go to homepage
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Go to dashboard
          </Link>
        </div>

        {/* Help links */}
        <div className="mt-10 flex items-center justify-center gap-6 text-sm text-gray-400">
          <Link href="/tools" className="hover:text-brand-600 transition-colors">Free Tools</Link>
          <Link href="/tools/chatbot-tester" className="hover:text-brand-600 transition-colors">Chatbot Tester</Link>
          <a href="mailto:hello@scale2sales.com" className="hover:text-brand-600 transition-colors">Contact Support</a>
        </div>
      </div>
    </div>
  )
}
