import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Scale2Sales',
  description: 'Privacy Policy for Scale2Sales — AI Chatbot Platform',
}

export default function PrivacyPolicyPage() {
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
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to home</Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: April 26, 2025</p>
        </div>

        <div className="prose max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>Scale2Sales ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI chatbot platform at scale2sales.com (the "Service").</p>
            <p className="mt-3">Please read this policy carefully. By using our Service, you agree to the collection and use of information in accordance with this policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Information you provide directly:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email address, company name, password)</li>
              <li>Payment information (processed securely by Stripe — we never store card details)</li>
              <li>Website URLs you submit for scanning</li>
              <li>Chat conversations with AI chatbots</li>
              <li>Team member information you add</li>
            </ul>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Information collected automatically:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usage data (pages visited, features used, message counts)</li>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate location</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, operate, and maintain our Service</li>
              <li>To process payments and manage subscriptions</li>
              <li>To train AI chatbots on your website content</li>
              <li>To send you service-related emails and notifications</li>
              <li>To monitor and analyze usage patterns to improve the Service</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
              <li>To respond to your support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. How We Share Your Information</h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Service providers:</strong> Supabase (database), Stripe (payments), Anthropic (AI processing), Vercel (hosting)</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="mt-3">All third-party providers are bound by their own privacy policies and data processing agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your information:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>All data is encrypted in transit using SSL/TLS</li>
              <li>Data at rest is encrypted using AES-256</li>
              <li>Row-level security ensures your data is isolated from other users</li>
              <li>Payment data is handled exclusively by Stripe (PCI DSS compliant)</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Retention</h2>
            <p>We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us at legal@scale2sales.com.</p>
            <p className="mt-3">Some information may be retained for legal, accounting, or legitimate business purposes even after account deletion.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
              <li><strong>GDPR rights:</strong> EU residents have additional rights under GDPR</li>
              <li><strong>CCPA rights:</strong> California residents have additional rights under CCPA</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at legal@scale2sales.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Cookies</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences</li>
              <li>Analyze how our Service is used</li>
            </ul>
            <p className="mt-3">You can control cookies through your browser settings. Disabling cookies may affect some features of our Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Children's Privacy</h2>
            <p>Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us at legal@scale2sales.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us:</p>
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
          <p className="text-sm text-gray-400">© 2025 Scale2Sales. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
