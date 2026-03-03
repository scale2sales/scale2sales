import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">ChatFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-500" />
          Now in public beta
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          AI chatbots for
          <br />
          <span className="text-brand-600">every product</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          ChatFlow lets you spin up AI-powered chatbots for your websites in minutes.
          Multi-tenant, streaming responses, conversation history — all included.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            Start for free →
          </Link>
          <Link
            href="#features"
            className="px-6 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Learn more
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything you need to ship
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '⚡',
              title: 'Streaming responses',
              desc: 'Real-time token-by-token streaming for a natural chat experience.',
            },
            {
              icon: '🏢',
              title: 'Multi-tenant',
              desc: 'Each organization gets isolated data with proper row-level security.',
            },
            {
              icon: '📜',
              title: 'Conversation history',
              desc: 'Full message history stored per project with usage analytics.',
            },
            {
              icon: '🔐',
              title: 'Auth built-in',
              desc: 'Email/password auth via Supabase with protected dashboard routes.',
            },
            {
              icon: '💳',
              title: 'Stripe billing',
              desc: 'Starter and Pro plans with webhook-synced subscription status.',
            },
            {
              icon: '🛡️',
              title: 'Row-level security',
              desc: 'Every record scoped to organization_id with Postgres RLS policies.',
            },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Simple pricing</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { name: 'Free', price: '$0', msgs: '50 msg/mo', projects: '1 project', cta: 'Get started', highlighted: false },
            { name: 'Starter', price: '$29', msgs: '1,000 msg/mo', projects: '5 projects', cta: 'Start trial', highlighted: true },
            { name: 'Pro', price: '$99', msgs: '10,000 msg/mo', projects: 'Unlimited', cta: 'Start trial', highlighted: false },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-2xl border ${
                plan.highlighted
                  ? 'border-brand-500 shadow-lg shadow-brand-100 bg-brand-600 text-white'
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            >
              <p className={`text-sm font-semibold uppercase tracking-wide mb-2 ${plan.highlighted ? 'text-brand-200' : 'text-gray-400'}`}>
                {plan.name}
              </p>
              <p className="text-4xl font-bold mb-1">{plan.price}</p>
              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-brand-200' : 'text-gray-500'}`}>/month</p>
              <ul className="space-y-2 mb-6">
                {[plan.msgs, plan.projects, 'All features'].map((f) => (
                  <li key={f} className={`text-sm flex items-center gap-2 ${plan.highlighted ? 'text-white' : 'text-gray-600'}`}>
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block text-center text-sm font-semibold py-2.5 rounded-lg transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-brand-600 hover:bg-brand-50'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-400">© 2025 ChatFlow. Built with Next.js + Supabase.</p>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">Login</Link>
            <Link href="/signup" className="text-sm text-gray-400 hover:text-gray-600">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
