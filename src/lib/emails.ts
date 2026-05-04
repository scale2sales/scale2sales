// @ts-nocheck
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Scale2Sales <hello@scale2sales.com>'
const BASE_URL = 'https://scale2sales.com'

// Welcome email after signup
export async function sendWelcomeEmail({ email, name }: { email: string; name?: string }) {
  const firstName = name?.split(' ')[0] || 'there'

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to Scale2Sales, ${firstName}!`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">

  <!-- Header -->
  <div style="background:#ffffff;border-radius:16px;padding:32px;margin-bottom:16px;text-align:center;border:1px solid #e5e7eb;">
    <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px;">
      <div style="width:36px;height:36px;background:#6366f1;border-radius:8px;display:inline-block;"></div>
      <span style="font-size:22px;font-weight:700;color:#111827;">Scale2Sales</span>
    </div>
    <h1 style="font-size:26px;font-weight:700;color:#111827;margin:0 0 12px;">
      Welcome, ${firstName}! 🎉
    </h1>
    <p style="font-size:16px;color:#6b7280;margin:0;">
      Your AI chatbot platform is ready. Let's get your first chatbot live in 5 minutes.
    </p>
  </div>

  <!-- Steps -->
  <div style="background:#ffffff;border-radius:16px;padding:32px;margin-bottom:16px;border:1px solid #e5e7eb;">
    <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 20px;">Get started in 3 steps</h2>
    
    <div style="display:flex;gap:16px;margin-bottom:20px;align-items:flex-start;">
      <div style="width:32px;height:32px;background:#6366f1;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-weight:700;font-size:14px;text-align:center;line-height:32px;">1</div>
      <div>
        <p style="font-weight:600;color:#111827;margin:0 0 4px;">Create a project</p>
        <p style="color:#6b7280;font-size:14px;margin:0;">Enter your website URL and let AI scan your content automatically.</p>
      </div>
    </div>

    <div style="display:flex;gap:16px;margin-bottom:20px;align-items:flex-start;">
      <div style="width:32px;height:32px;background:#6366f1;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-weight:700;font-size:14px;text-align:center;line-height:32px;">2</div>
      <div>
        <p style="font-weight:600;color:#111827;margin:0 0 4px;">Test your chatbot</p>
        <p style="color:#6b7280;font-size:14px;margin:0;">Ask it questions about your business and see how it responds.</p>
      </div>
    </div>

    <div style="display:flex;gap:16px;margin-bottom:24px;align-items:flex-start;">
      <div style="width:32px;height:32px;background:#6366f1;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-weight:700;font-size:14px;text-align:center;line-height:32px;">3</div>
      <div>
        <p style="font-weight:600;color:#111827;margin:0 0 4px;">Add to your website</p>
        <p style="color:#6b7280;font-size:14px;margin:0;">Share a link or embed with 2 lines of code. WordPress plugin available.</p>
      </div>
    </div>

    <a href="${BASE_URL}/dashboard" style="display:block;background:#6366f1;color:#ffffff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;">
      Go to your dashboard →
    </a>
  </div>

  <!-- Free plan info -->
  <div style="background:#eff6ff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #bfdbfe;">
    <h3 style="font-size:16px;font-weight:700;color:#1e40af;margin:0 0 8px;">Your free plan includes</h3>
    <ul style="color:#3b82f6;font-size:14px;margin:0;padding-left:20px;line-height:1.8;">
      <li>50 messages per month</li>
      <li>1 chatbot project</li>
      <li>Website scanner</li>
      <li>Embed widget</li>
      <li>Share link</li>
    </ul>
    <p style="margin:12px 0 0;font-size:13px;color:#3b82f6;">
      Need more? <a href="${BASE_URL}/dashboard/billing" style="color:#1d4ed8;font-weight:600;">Upgrade to Starter for $29/mo</a> — includes 1,000 messages and a 14-day free trial.
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:16px;">
    <p style="font-size:12px;color:#9ca3af;margin:0;">
      © 2025 Scale2Sales · 
      <a href="${BASE_URL}/privacy" style="color:#9ca3af;">Privacy</a> · 
      <a href="${BASE_URL}/terms" style="color:#9ca3af;">Terms</a>
    </p>
    <p style="font-size:12px;color:#9ca3af;margin:4px 0 0;">
      Questions? Reply to this email or contact <a href="mailto:hello@scale2sales.com" style="color:#6366f1;">hello@scale2sales.com</a>
    </p>
  </div>

</div>
</body>
</html>`,
  })
}

// Trial expiry warning — 2 days before
export async function sendTrialExpiryWarningEmail({ email, name, daysLeft = 2 }: { email: string; name?: string; daysLeft?: number }) {
  const firstName = name?.split(' ')[0] || 'there'

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your Scale2Sales trial expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">

  <div style="background:#ffffff;border-radius:16px;padding:32px;margin-bottom:16px;border:1px solid #e5e7eb;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:36px;height:36px;background:#6366f1;border-radius:8px;display:inline-block;"></div>
      <span style="font-size:22px;font-weight:700;color:#111827;vertical-align:middle;margin-left:8px;">Scale2Sales</span>
    </div>

    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
      <p style="font-size:16px;font-weight:700;color:#92400e;margin:0;">
        ⏰ Your trial expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}
      </p>
    </div>

    <h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 12px;">
      Hey ${firstName}, don't lose your chatbot!
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 20px;line-height:1.6;">
      Your 14-day free trial ends soon. After that, your chatbot will stop responding to customers until you upgrade.
    </p>

    <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 12px;">What you keep with Starter ($29/mo):</h3>
      <ul style="color:#374151;font-size:14px;margin:0;padding-left:20px;line-height:2;">
        <li>1,000 messages per month</li>
        <li>5 chatbot projects</li>
        <li>Analytics dashboard</li>
        <li>Email support</li>
        <li>Everything in your trial</li>
      </ul>
    </div>

    <a href="${BASE_URL}/dashboard/billing" style="display:block;background:#6366f1;color:#ffffff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;margin-bottom:16px;">
      Upgrade now — keep my chatbot →
    </a>

    <p style="text-align:center;font-size:13px;color:#9ca3af;margin:0;">
      Or <a href="${BASE_URL}/dashboard/billing" style="color:#6366f1;">switch to annual billing</a> and save 35% ($19/mo)
    </p>
  </div>

  <div style="text-align:center;padding:16px;">
    <p style="font-size:12px;color:#9ca3af;margin:0;">
      © 2025 Scale2Sales · 
      <a href="${BASE_URL}/privacy" style="color:#9ca3af;">Privacy</a> · 
      <a href="${BASE_URL}/terms" style="color:#9ca3af;">Terms</a>
    </p>
  </div>

</div>
</body>
</html>`,
  })
}

// Trial expired email
export async function sendTrialExpiredEmail({ email, name }: { email: string; name?: string }) {
  const firstName = name?.split(' ')[0] || 'there'

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your Scale2Sales trial has ended',
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">

  <div style="background:#ffffff;border-radius:16px;padding:32px;margin-bottom:16px;border:1px solid #e5e7eb;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:36px;height:36px;background:#6366f1;border-radius:8px;display:inline-block;"></div>
      <span style="font-size:22px;font-weight:700;color:#111827;vertical-align:middle;margin-left:8px;">Scale2Sales</span>
    </div>

    <h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 12px;">
      Hey ${firstName}, your trial has ended
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 20px;line-height:1.6;">
      Your 14-day free trial has expired. Your chatbot is currently paused and not responding to customers.
    </p>
    <p style="font-size:15px;color:#6b7280;margin:0 0 24px;line-height:1.6;">
      Upgrade now to reactivate your chatbot and keep answering customer questions 24/7.
    </p>

    <a href="${BASE_URL}/dashboard/billing" style="display:block;background:#6366f1;color:#ffffff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;margin-bottom:16px;">
      Reactivate my chatbot →
    </a>

    <div style="background:#f9fafb;border-radius:12px;padding:16px;text-align:center;">
      <p style="font-size:14px;color:#6b7280;margin:0;">
        Starter plan: <strong>$29/mo</strong> or <strong>$19/mo</strong> billed annually
      </p>
      <p style="font-size:13px;color:#9ca3af;margin:8px 0 0;">
        Questions? Email us at <a href="mailto:hello@scale2sales.com" style="color:#6366f1;">hello@scale2sales.com</a>
      </p>
    </div>
  </div>

  <div style="text-align:center;padding:16px;">
    <p style="font-size:12px;color:#9ca3af;margin:0;">
      © 2025 Scale2Sales · 
      <a href="${BASE_URL}/privacy" style="color:#9ca3af;">Privacy</a> · 
      <a href="${BASE_URL}/terms" style="color:#9ca3af;">Terms</a>
    </p>
  </div>

</div>
</body>
</html>`,
  })
}
