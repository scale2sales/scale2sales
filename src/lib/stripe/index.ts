import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLANS = {
  free: {
    name: 'Free',
    priceId: null,
    monthlyMessages: 50,
    projects: 1,
  },
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    monthlyMessages: 1000,
    projects: 5,
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    monthlyMessages: 10000,
    projects: 50,
  },
} as const

export type PlanKey = keyof typeof PLANS

export function isSubscriptionActive(status: string | null): boolean {
  return status === 'active' || status === 'trialing'
}

export async function createOrRetrieveCustomer({
  email,
  organizationId,
}: {
  email: string
  organizationId: string
}): Promise<string> {
  const existing = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existing.data.length > 0) {
    return existing.data[0].id
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { organization_id: organizationId },
  })

  return customer.id
}
