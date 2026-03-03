# ChatFlow — AI SaaS Starter

A production-grade multi-tenant AI chatbot platform built with **Next.js 14**, **Supabase**, **Stripe**, and **TailwindCSS**.

## Features

- ✅ Email/password auth via Supabase with middleware session handling
- ✅ Multi-tenant: every record is scoped to `organization_id`
- ✅ Row-level security on all tables
- ✅ Streaming AI responses (SSE / ReadableStream)
- ✅ Conversation history with token usage logging
- ✅ Stripe subscriptions (Starter + Pro plans) with webhook handler
- ✅ Subscription middleware gate on `/api/chat`
- ✅ Clean minimal SaaS UI, mobile responsive, no UI kit dependencies

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (landing)/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── projects/
│   │       ├── page.tsx
│   │       └── [id]/chat/page.tsx
│   ├── api/
│   │   ├── chat/route.ts           # Streaming AI endpoint
│   │   └── webhooks/stripe/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/           Button, Input, Textarea, Card, Badge
│   ├── chat/         ChatInterface (streaming)
│   └── layout/       Sidebar
├── lib/
│   ├── actions/      auth.ts, projects.ts  (Server Actions)
│   ├── supabase/     server.ts, client.ts, middleware.ts
│   ├── stripe/       index.ts
│   └── utils.ts
├── types/
│   └── database.ts
├── middleware.ts     # Auth routing
supabase/
└── migrations/001_initial_schema.sql
```

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd ai-saas-starter
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`.

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **Anon Key** into `.env.local`
3. Copy your **Service Role Key** into `.env.local`
4. Open the **SQL Editor** and run the migration:

```sql
-- Paste contents of supabase/migrations/001_initial_schema.sql
```

### 4. Set up Stripe

1. Create a [Stripe](https://stripe.com) account
2. Create two products/prices (Starter + Pro monthly)
3. Copy keys into `.env.local`
4. Set up webhook endpoint to `https://your-domain.com/api/webhooks/stripe`
5. Events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_failed`

For local development, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Connecting a Real AI Provider

The `/api/chat` route currently uses a mock streaming generator. To use a real AI:

### OpenAI

```bash
npm install openai
```

Replace the `generateMockStream` usage in `src/app/api/chat/route.ts`:

```typescript
import OpenAI from 'openai'
const openai = new OpenAI()

const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: project.system_prompt ?? 'You are a helpful assistant.' },
    { role: 'user', content: message },
  ],
  stream: true,
})

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content ?? ''
  if (delta) {
    accumulated += delta
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`))
  }
}
```

### Anthropic / Claude

```bash
npm install @anthropic-ai/sdk
```

```typescript
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic()

const stream = anthropic.messages.stream({ ... })
for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
    const delta = event.delta.text
    // same pattern as above
  }
}
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Add all environment variables in the Vercel dashboard. Update `NEXT_PUBLIC_APP_URL` to your production URL.

## Database

| Table | Description |
|---|---|
| `organizations` | Tenant root. Holds Stripe & plan info |
| `org_users` | User↔org membership with role |
| `projects` | Chatbot projects per org |
| `conversations` | Chat sessions per project/user |
| `messages` | Individual messages in a conversation |
| `usage_logs` | Token usage per request for analytics |

All tables have Row Level Security enabled, scoped to `organization_id` via the current user's memberships.
