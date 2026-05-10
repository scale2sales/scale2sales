import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Scale2Sales -- AI Chatbot for Your Website in 5 Minutes',
  description: 'Add an AI chatbot trained on your website to capture leads, answer questions 24/7, and convert visitors into customers. No coding required. Free plan available.',
  keywords: 'ai chatbot, website chatbot, lead generation chatbot, customer support ai, chatbot for website',
}

const stats = [
  { value: '3x', label: 'More leads captured' },
  { value: '24/7', label: 'Always available' },
  { value: '5 min', label: 'Setup time' },
  { value: '35%', label: 'More conversions' },
]

const features = [
  { icon: '🔍', title: 'Trains on your website automatically', desc: 'Just enter your URL. We scan up to 20 pages and train the AI on your products, services, pricing, and FAQs -- no manual setup needed.' },
  { icon: '⚡', title: 'Live on your site in 5 minutes', desc: 'Copy 2 lines of code and paste before closing body tag. Works on any website -- WordPress, Shopify, Webflow, custom HTML.' },
  { icon: '💬', title: 'Answers customer questions instantly', desc: 'No more waiting for email replies. Your AI answers pricing, availability, features, and support questions the moment visitors ask.' },
  { icon: '🎯', title: 'Captures leads automatically', desc: 'The chatbot collects visitor names, emails, and intent -- turning casual browsers into qualified leads while you sleep.' },
  { icon: '🎨', title: 'Fully customizable', desc: 'Match your brand colors, set a custom greeting, name your assistant, and position it anywhere on your page.' },
  { icon: '📊', title: 'Analytics and conversation history', desc: 'See every conversation, track token usage, and understand exactly what your visitors are asking about.' },
]

const testimonials = [
  { quote: 'We added Scale2Sales to our SaaS landing page and our trial signups went up 40% in the first week. Customers get answers instantly instead of emailing us.', name: 'Sarah Chen', title: 'Founder, DevTools Pro', avatar: 'SC', color: '#6366f1' },
  { quote: 'Our restaurant gets 50+ questions a day about hours, reservations, and menu. Scale2Sales answers all of them automatically. It paid for itself in 2 days.', name: 'Marcus Williams', title: 'Owner, The Harbor Grill', avatar: 'MW', color: '#0f6e56' },
  { quote: 'I was skeptical an AI could really understand our legal services, but it scanned our site and now answers client FAQs better than our old FAQ page ever did.', name: 'Jennifer Park', title: 'Managing Partner, Park Legal', avatar: 'JP', color: '#993556' },
]

const faqs = [
  { q: 'How does the AI learn about my business?', a: 'When you create a project, enter your website URL and click Scan Site. Our AI reads up to 20 pages of your website -- services, pricing, about page, FAQs -- and builds a custom knowledge base automatically. No manual input needed.' },
  { q: 'Do I need coding skills?', a: 'None at all. You paste 2 lines of code before the closing body tag on your website. If you use WordPress, Webflow, Shopify, or similar, it takes under 2 minutes.' },
  { q: 'What if the AI does not know the answer?', a: 'You can customize the system prompt to tell the AI exactly what to do when it does not know something -- like asking the visitor to contact you directly, or capturing their email for a follow-up.' },
  { q: 'Can I try it before paying?', a: 'Yes! The Free plan gives you 50 messages per month with no credit card required. Both Starter and Pro plans include a 14-day free trial.' },
  { q: 'Will it work on my website platform?', a: 'Yes -- Scale2Sales works on any website that allows custom HTML. This includes WordPress, Shopify, Webflow, Wix, Squarespace, custom HTML sites, and more.' },
  { q: 'How is my data protected?', a: 'All data is encrypted at rest and in transit. Each organization data is completely isolated with row-level security. We never share your data or use it to train other customers AI.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Scale2Sales</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/tools" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Free Tools</Link>
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link href="/signup" className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors">Start free</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8 border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          14-day free trial -- No credit card required
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
          Your website works 9-5.
          <br />
          <span className="text-brand-600">Your AI chatbot works 24/7.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Add an AI assistant trained on your website in 5 minutes. It answers customer questions, captures leads, and converts visitors -- even while you sleep.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 text-lg">
            Start for free -- takes 5 minutes
          </Link>
          <Link href="/tools/chatbot-tester" className="w-full sm:w-auto px-8 py-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-lg">
            Try a live demo first
          </Link>
        </div>
        <p className="text-sm text-gray-400">Free plan available -- No coding required -- Works on any website</p>
      </section>

      <section className="border-y border-gray-100 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-brand-600 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Up and running in 3 steps</h2>
          <p className="text-gray-500 text-lg">No developers needed. No training data to upload. Just your website URL.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Enter your website URL', desc: 'Create a project and paste your website URL. Our AI scans up to 20 pages and learns everything about your business.', color: 'bg-brand-50 text-brand-700' },
            { step: '02', title: 'Customize your chatbot', desc: 'Set your brand colors, greeting message, and widget name. Preview exactly how it will look before going live.', color: 'bg-purple-50 text-purple-700' },
            { step: '03', title: 'Paste 2 lines of code', desc: 'Copy the embed snippet and paste it into your website HTML. Works on WordPress, Shopify, Webflow, or any custom site.', color: 'bg-green-50 text-green-700' },
          ].map((item) => (
            <div key={item.step}>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${item.color} font-bold text-lg mb-4`}>{item.step}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything you need to convert more visitors</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Built for small businesses, startups, and agencies who want to turn website traffic into revenue.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-brand-200 hover:shadow-sm transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Businesses love Scale2Sales</h2>
          <p className="text-gray-500 text-lg">Join hundreds of businesses using AI to capture more leads and answer customer questions 24/7.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-5 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: t.color }}>{t.avatar}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500 text-lg">Start free. Upgrade when you are ready. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', period: 'forever', desc: 'Perfect for testing', features: ['50 messages/month', '1 project', 'Embed widget', 'Community support'], cta: 'Get started free', href: '/signup', highlight: false },
              { name: 'Starter', price: '$29', annualPrice: '$19', period: '/month', desc: 'For small businesses', features: ['1,000 messages/month', '5 projects', '10 pages scanned', '3 team members', 'Analytics', 'Email support', '14-day free trial'], cta: 'Start free trial', href: '/signup', highlight: true, badge: 'Most popular' },
              { name: 'Pro', price: '$99', annualPrice: '$64', period: '/month', desc: 'For growing teams', features: ['10,000 messages/month', 'Unlimited projects', '20 pages scanned', 'Unlimited team members', 'Advanced analytics', 'API access', 'Priority support', '14-day free trial'], cta: 'Start free trial', href: '/signup', highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`relative p-6 rounded-2xl flex flex-col ${plan.highlight ? 'bg-brand-600 text-white shadow-xl shadow-brand-200' : 'bg-white border border-gray-200'}`}>
                {plan.badge && (
                  <div className="absolute -top-3 right-1/2 -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full">{plan.badge}</span>
                  </div>
                )}
                <div className="mb-5">
                  <p className={`text-sm font-semibold uppercase tracking-wide mb-1 ${plan.highlight ? 'text-brand-200' : 'text-gray-400'}`}>{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-brand-200' : 'text-gray-400'}`}>{plan.period}</span>
                  </div>
                  {plan.annualPrice && (
                    <p className={`text-xs mt-1 ${plan.highlight ? 'text-brand-200' : 'text-gray-400'}`}>or {plan.annualPrice}/mo billed annually -- save 35%</p>
                  )}
                  <p className={`text-sm mt-2 ${plan.highlight ? 'text-brand-100' : 'text-gray-500'}`}>{plan.desc}</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-brand-100' : 'text-gray-600'}`}>
                      <svg className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-brand-300' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? 'bg-white text-brand-600 hover:bg-brand-50' : 'bg-brand-600 text-white hover:bg-brand-700'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">All plans include SSL encryption, 99.9% uptime SLA, and GDPR compliance.</p>
        </div>
      </section>

      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently asked questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-600 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Your competitors are already using AI.</h2>
          <p className="text-brand-200 text-xl mb-10 leading-relaxed">Every day without a chatbot is leads lost to competitors who answer faster. Get started free -- no credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 rounded-xl bg-white text-brand-600 font-bold hover:bg-brand-50 transition-colors text-lg">Start for free -- 5 minutes to launch</Link>
            <Link href="/tools/chatbot-tester" className="px-8 py-4 rounded-xl border border-brand-400 text-white font-semibold hover:bg-brand-700 transition-colors text-lg">Try demo first</Link>
          </div>
          <p className="text-brand-300 text-sm mt-6">Free plan available -- 14-day trial on paid plans -- Cancel anytime</p>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
              <span className="font-bold text-gray-900">Scale2Sales</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <Link href="/tools" className="hover:text-gray-600">Free Tools</Link>
              <Link href="/tools/chatbot-tester" className="hover:text-gray-600">Chatbot Tester</Link>
              <Link href="/tools/website-analyzer" className="hover:text-gray-600">Website Analyzer</Link>
              <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-600">Terms</Link>
              <Link href="/login" className="hover:text-gray-600">Login</Link>
              <Link href="/signup" className="hover:text-gray-600">Sign up</Link>
            </div>
            <p className="text-sm text-gray-400">2025 Scale2Sales. All rights reserved.</p>
          </div>
        </div>
      </footer>

    {/* Scale2Sales Support Chatbot */}
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.Scale2SalesConfig = {
            projectId: "d5507f3c-29e6-4b11-b19b-d1e05e0227a1",
            appUrl: "https://scale2sales.com",
            primaryColor: "#6366f1",
            widgetName: "Scale2Sales Support",
            greeting: "Hi! I can answer questions about Scale2Sales -- pricing, features, how to get started. What would you like to know?",
            position: "right"
          };
        `
      }}
    />
    <script src="https://scale2sales.com/widget.js" async />
    </div>
  )
}
