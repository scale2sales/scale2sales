'use client'
// @ts-nocheck
import { useState } from 'react'
import Link from 'next/link'

const PLAN_DETAILS = {
  free: {
    name: 'Free', monthlyPrice: 0, annualPrice: 0,
    color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200',
    features: ['50 messages / month', '1 project', 'Embed widget', 'Community support'],
  },
  starter: {
    name: 'Starter', monthlyPrice: 29, annualPrice: 19, annualTotal: 226,
    color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-300',
    popular: true,
    features: ['1,000 messages / month', '5 projects', '10 pages scanned', '3 team members', 'Analytics', 'Email support', '14-day free trial'],
  },
  pro: {
    name: 'Pro', monthlyPrice: 99, annualPrice: 64, annualTotal: 773,
    color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-300',
    features: ['10,000 messages / month', 'Unlimited projects', '20 pages scanned', 'Unlimited team members', 'Advanced analytics', 'API access', 'Priority support', '14-day free trial'],
  },
}

export function BillingClient({ org, currentPlan, planLimits, usage, success, canceled, successPlan }: any) {
  const [loading, setLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')

  async function handleUpgrade(planKey: string) {
    setLoading(planKey + billingInterval)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey, interval: billingInterval }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Failed to start checkout')
    } catch { alert('Something went wrong. Please try again.') }
    setLoading(null)
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Failed to open billing portal')
    } catch { alert('Something went wrong.') }
    setPortalLoading(false)
  }

  const planLimit = planLimits?.monthlyMessages ?? 50
  const usagePercent = Math.min((usage.messages / planLimit) * 100, 100)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold text-green-800">Welcome to {successPlan ? PLAN_DETAILS[successPlan]?.name : 'your new plan'}!</p>
            <p className="text-sm text-green-600">Your subscription is now active. Enjoy your upgraded features!</p>
          </div>
        </div>
      )}
      {canceled && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 font-medium">Checkout canceled — no charges were made.</p>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
          <p className="text-gray-500 mt-1">Manage your subscription and usage</p>
        </div>
        {org?.stripe_customer_id && currentPlan !== 'free' && (
          <button onClick={handlePortal} disabled={portalLoading}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            {portalLoading ? 'Loading...' : 'Manage billing →'}
          </button>
        )}
      </div>

      {/* Usage cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Current plan</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-4 py-2 rounded-xl ${PLAN_DETAILS[currentPlan]?.bg} ${PLAN_DETAILS[currentPlan]?.border} border`}>
              <p className={`text-lg font-bold ${PLAN_DETAILS[currentPlan]?.color}`}>{PLAN_DETAILS[currentPlan]?.name}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${PLAN_DETAILS[currentPlan]?.monthlyPrice}<span className="text-sm font-normal text-gray-400">/mo</span></p>
              {org?.subscription_status === 'trialing' && <span className="text-xs text-yellow-600 font-medium">🎁 Trial active</span>}
              {org?.subscription_status === 'active' && <span className="text-xs text-green-600 font-medium">✅ Active</span>}
            </div>
          </div>
          {currentPlan !== 'free' && (
            <button onClick={handlePortal} className="text-sm text-brand-600 hover:underline">Cancel or change plan →</button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">This month's usage</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Messages</span>
                <span className="font-medium text-gray-900">{usage.messages.toLocaleString()} / {planLimit.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-brand-500'}`} style={{ width: `${usagePercent}%` }}/>
              </div>
              {usagePercent > 80 && <p className="text-xs text-yellow-600 mt-1">⚠️ {Math.round(usagePercent)}% used — upgrade to avoid interruption</p>}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Projects</span>
              <span className="font-medium">{usage.projects} / {planLimits?.projects >= 50 ? 'Unlimited' : planLimits?.projects ?? 1}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tokens used</span>
              <span className="font-medium">{usage.tokens.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{currentPlan === 'free' ? 'Upgrade your plan' : 'Available plans'}</h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setBillingInterval('month')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${billingInterval === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </button>
          <button onClick={() => setBillingInterval('year')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billingInterval === 'year' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            Annual
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Save 35%</span>
          </button>
        </div>
        {billingInterval === 'year' && (
          <p className="text-sm text-green-600 font-medium mt-2">🎉 Save ${(29 - 19) * 12}/yr on Starter · Save ${(99 - 64) * 12}/yr on Pro</p>
        )}
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(PLAN_DETAILS).map(([key, plan]) => {
          const isCurrent = key === currentPlan
          const displayPrice = billingInterval === 'year' ? plan.annualPrice : plan.monthlyPrice
          return (
            <div key={key} className={`relative rounded-2xl border-2 p-6 flex flex-col ${plan.popular ? 'border-brand-500 shadow-lg' : 'border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Current</span>
                </div>
              )}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-gray-900">${displayPrice}</span>
                  <span className="text-gray-400 text-sm">/mo</span>
                </div>
                {billingInterval === 'year' && plan.annualTotal && (
                  <p className="text-xs text-gray-400 mt-0.5">Billed ${plan.annualTotal}/yr <span className="text-green-600 font-medium">(save ${(plan.monthlyPrice - plan.annualPrice) * 12}/yr)</span></p>
                )}
                {billingInterval === 'month' && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">Or <span className="text-green-600 font-medium">${plan.annualPrice}/mo</span> billed annually</p>
                )}
                {plan.monthlyPrice > 0 && <p className="text-xs text-green-600 font-medium mt-1">✨ 14-day free trial</p>}
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <button disabled className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">Current plan</button>
              ) : key === 'free' ? (
                <button disabled className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">Free forever</button>
              ) : (
                <button onClick={() => handleUpgrade(key)} disabled={!!loading}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.popular ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-gray-900 text-white hover:bg-gray-800'} disabled:opacity-50`}>
                  {loading === key + billingInterval ? 'Loading...' : currentPlan === 'free' ? 'Start free trial →' : `Switch to ${plan.name}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Billing FAQ</h2>
        <div className="space-y-4">
          {[
            { q: 'Is the trial free?', a: 'Yes! Both Starter and Pro include a 14-day free trial. No credit card required to start.' },
            { q: 'How does annual billing work?', a: 'You pay for the full year upfront and save 35%. Starter is $226/yr ($19/mo) and Pro is $773/yr ($64/mo).' },
            { q: 'What happens when I hit my message limit?', a: 'Your chatbot stops responding until the next billing cycle. Upgrade anytime to increase your limit.' },
            { q: 'Can I cancel anytime?', a: 'Yes — cancel from the billing portal. You keep access until the end of your billing period.' },
            { q: 'Can I switch from monthly to annual?', a: "Yes! Click 'Manage billing' to switch anytime. We'll prorate the difference." },
          ].map(item => (
            <div key={item.q} className="border border-gray-100 rounded-xl p-4">
              <p className="font-semibold text-gray-900 mb-1">{item.q}</p>
              <p className="text-sm text-gray-500">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
