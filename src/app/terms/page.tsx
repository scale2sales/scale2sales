import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Scale2Sales',
  description: 'Terms of Service for Scale2Sales — AI Chatbot Platform',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900">Scale2Sales</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">Back to home</Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-gray-500">Last updated: April 26, 2025</p>
        </div>

        <div className="prose max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using Scale2Sales ("Service") at scale2sales.com, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.</p>
            <p className="mt-3">These Terms apply to all users, including visitors, registered users, and paying customers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
            <p>Scale2Sales provides an AI-powered chatbot platform that allows businesses to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Create AI chatbots trained on their website content</li>
              <li>Embed chatbots on their websites</li>
              <li>Manage conversations and analytics</li>
              <li>Use free tools for website analysis and chatbot testing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Account Registration</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 18 years old to use the Service</li>
              <li>One person or entity may not maintain more than one free account</li>
              <li>You are responsible for all activity that occurs under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Subscription Plans and Billing</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Free Plan</h3>
            <p>We offer a free plan with limited features. No credit card required.</p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Paid Plans</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Starter: $29/month or $226/year (save 35%)</li>
              <li>Pro: $99/month or $773/year (save 35%)</li>
              <li>All paid plans include a 14-day free trial</li>
              <li>You will be charged at the end of your trial period unless you cancel</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Billing Terms</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions are billed in advance on a monthly or annual basis</li>
              <li>All fees are non-refundable except as required by law or our refund policy</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
              <li>Payments are processed securely by Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Refund Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We offer a full refund within 7 days of your first payment if you are not satisfied</li>
              <li>After 7 days, subscriptions are non-refundable</li>
              <li>To request a refund, contact support@scale2sales.com within 7 days of purchase</li>
              <li>Annual plan refunds are prorated based on months remaining</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Transmit spam, malware, or harmful content</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in fraudulent or deceptive practices</li>
              <li>Attempt to gain unauthorized access to any system</li>
              <li>Scrape or collect data from our Service without permission</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
            </ul>
            <p className="mt-3">Violation of these terms may result in immediate termination of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Content and Intellectual Property</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Content</h3>
            <p>You retain ownership of all content you submit to the Service, including website content used to train chatbots. By using the Service, you grant us a limited license to process your content solely to provide the Service.</p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Our Content</h3>
            <p>The Service, including all software, designs, and content created by Scale2Sales, is our intellectual property and protected by copyright, trademark, and other laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Message Limits</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free plan: 50 messages per month</li>
              <li>Starter plan: 1,000 messages per month</li>
              <li>Pro plan: 10,000 messages per month</li>
              <li>Limits reset on the 1st of each month</li>
              <li>Unused messages do not roll over</li>
              <li>Exceeding limits will pause your chatbot until the next billing cycle</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Cancellation</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may cancel your subscription at any time from the billing portal</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>You retain access to paid features until the end of your billing period</li>
              <li>After cancellation, your account reverts to the free plan</li>
              <li>We reserve the right to terminate accounts that violate these Terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Disclaimers and Limitation of Liability</h2>
            <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.</p>
            <p className="mt-3">TO THE MAXIMUM EXTENT PERMITTED BY LAW, SCALE2SALES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.</p>
            <p className="mt-3">OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Indemnification</h2>
            <p>You agree to indemnify and hold harmless Scale2Sales and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Georgia, United States, without regard to its conflict of law provisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or a notice on our website. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Contact Us</h2>
            <p>If you have questions about these Terms, please contact us:</p>
            <div className="mt-3 bg-gray-50 rounded-xl p-5 space-y-2">
              <p><strong>Scale2Sales</strong></p>
              <p>Email: <a href="mailto:legal@scale2sales.com" className="text-brand-600 hover:underline">legal@scale2sales.com</a></p>
              <p>Website: <a href="https://scale2sales.com" className="text-brand-600 hover:underline">scale2sales.com</a></p>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 mt-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-400">2025 Scale2Sales. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
