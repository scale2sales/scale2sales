// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Scale2Sales-Bot/1.0)',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)

  const html = await res.text()

  // Strip scripts, styles, nav, footer
  const cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned.slice(0, 5000)
}

function extractLinks(html: string, baseUrl: string): string[] {
  const urls: string[] = []
  const base = new URL(baseUrl)
  const matches = html.matchAll(/href=["']([^"']+)["']/gi)

  for (const match of matches) {
    try {
      const url = new URL(match[1], baseUrl)
      if (
        url.hostname === base.hostname &&
        !url.pathname.match(/\.(pdf|jpg|jpeg|png|gif|svg|css|js|zip)$/i) &&
        !urls.includes(url.href) &&
        urls.length < 5
      ) {
        urls.push(url.href)
      }
    } catch {}
  }

  return urls
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, projectId } = await req.json()

  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

  // Normalize URL
  let normalizedUrl = url
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = 'https://' + normalizedUrl
  }

  try {
    // Fetch homepage HTML for link extraction
    const homeRes = await fetch(normalizedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Scale2Sales-Bot/1.0)' },
      signal: AbortSignal.timeout(10000),
    })

    const homeHtml = await homeRes.text()
    const homeText = homeHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000)

    // Find important sub-pages to scrape
    const subLinks = extractLinks(homeHtml, normalizedUrl)
    const priorityPages = subLinks.filter(link =>
      /about|contact|service|product|menu|price|faq|hours|team/i.test(link)
    ).slice(0, 3)

    // Scrape sub-pages
    let additionalContent = ''
    for (const link of priorityPages) {
      try {
        const text = await fetchPageText(link)
        additionalContent += `\n\n--- ${link} ---\n${text}`
      } catch {}
    }

    const allContent = homeText + additionalContent

    // Generate system prompt using AI
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `You are helping create an AI chatbot system prompt for a business website.

Here is the scraped content from their website:
${allContent}

Based on this content, create a helpful and accurate system prompt for an AI chatbot assistant for this business. The system prompt should:
1. Introduce the AI as a helpful assistant for this specific business
2. Include key facts: business name, what they offer, hours (if found), location (if found), contact info (if found)
3. List main products/services with prices if available
4. Include any FAQs or important policies found
5. End with: "Always be helpful, friendly, and accurate. If you don't know something, say so and suggest they contact us directly."

Keep it under 400 words. Return ONLY the system prompt text, nothing else.`,
          },
        ],
      }),
    })

    const aiData = await aiResponse.json()
    const systemPrompt = aiData.content?.[0]?.text || ''

    if (!systemPrompt) {
      return NextResponse.json({ error: 'Could not generate system prompt' }, { status: 500 })
    }

    // Update project with new system prompt if projectId provided
    if (projectId) {
      await supabase
        .from('projects')
        .update({ system_prompt: systemPrompt })
        .eq('id', projectId)
    }

    return NextResponse.json({
      success: true,
      systemPrompt,
      pagesScraped: 1 + priorityPages.length,
    })
  } catch (err: any) {
    console.error('Scraping error:', err)
    return NextResponse.json(
      { error: `Failed to scrape website: ${err.message}` },
      { status: 500 }
    )
  }
}
