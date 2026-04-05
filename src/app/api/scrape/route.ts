// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function fetchPageText(url: string): Promise<{ text: string; links: string[] }> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Scale2Sales-Bot/1.0)' },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const html = await res.text()

  const cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000)

  // Extract links
  const links: string[] = []
  const base = new URL(url)
  const matches = html.matchAll(/href=["']([^"'#?]+)["']/gi)
  for (const match of matches) {
    try {
      const u = new URL(match[1], url)
      if (
        u.hostname === base.hostname &&
        u.pathname !== '/' &&
        !u.pathname.match(/\.(pdf|jpg|jpeg|png|gif|svg|css|js|zip|xml|ico)$/i) &&
        !links.includes(u.href)
      ) {
        links.push(u.href)
      }
    } catch {}
  }

  return { text: cleaned, links }
}

// Priority scoring for pages
function scorePage(url: string): number {
  const path = url.toLowerCase()
  if (/\/(about|about-us|our-story)/.test(path)) return 10
  if (/\/(contact|contact-us|reach-us)/.test(path)) return 10
  if (/\/(service|services|what-we-do|solutions)/.test(path)) return 9
  if (/\/(product|products|shop|store|catalog)/.test(path)) return 9
  if (/\/(pricing|price|prices|plans|packages)/.test(path)) return 9
  if (/\/(faq|faqs|frequently-asked|help|support)/.test(path)) return 8
  if (/\/(menu|food|drink)/.test(path)) return 8
  if (/\/(hours|location|locations|find-us)/.test(path)) return 7
  if (/\/(team|staff|people|leadership)/.test(path)) return 6
  if (/\/(blog|news|articles|posts)/.test(path)) return 2
  return 3
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, projectId, maxPages = 15 } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl

  // Use streaming to send progress updates
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        send({ type: 'progress', message: 'Starting scan...', progress: 0, pagesFound: 0 })

        // Scrape homepage
        send({ type: 'progress', message: `Scanning homepage...`, progress: 5, pagesFound: 0 })
        const { text: homeText, links: homeLinks } = await fetchPageText(normalizedUrl)

        // Score and sort all found links
        const scoredLinks = [...new Set(homeLinks)]
          .map(link => ({ url: link, score: scorePage(link) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, maxPages - 1)

        send({
          type: 'progress',
          message: `Found ${scoredLinks.length} pages to scan`,
          progress: 10,
          pagesFound: scoredLinks.length,
        })

        // Scrape all pages
        const scrapedPages: { url: string; text: string }[] = [
          { url: normalizedUrl, text: homeText }
        ]

        for (let i = 0; i < scoredLinks.length; i++) {
          const page = scoredLinks[i]
          const progress = 10 + Math.round(((i + 1) / scoredLinks.length) * 70)

          send({
            type: 'progress',
            message: `Scanning: ${new URL(page.url).pathname}`,
            progress,
            pagesScanned: i + 1,
            totalPages: scoredLinks.length,
          })

          try {
            const { text } = await fetchPageText(page.url)
            scrapedPages.push({ url: page.url, text })
          } catch {
            // Skip failed pages silently
          }

          // Small delay to be respectful
          await new Promise(r => setTimeout(r, 200))
        }

        send({
          type: 'progress',
          message: 'Generating AI system prompt...',
          progress: 85,
          pagesScanned: scrapedPages.length,
        })

        // Combine all content
        const combinedContent = scrapedPages
          .map(p => `--- ${p.url} ---\n${p.text}`)
          .join('\n\n')
          .slice(0, 15000)

        // Generate system prompt with AI
        const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1200,
            messages: [{
              role: 'user',
              content: `You are creating an AI chatbot system prompt for a business website.

Here is content scraped from ${scrapedPages.length} pages of their website:

${combinedContent}

Create a comprehensive system prompt for an AI assistant for this business. Include:
1. Business name and what they do
2. All products/services with prices if found
3. Hours of operation if found
4. Location and contact info if found
5. Key FAQs or policies found
6. Tone and personality guidelines
7. What to do if asked something you don't know

End with: "Always be helpful, friendly, and accurate. If you don't know something specific, suggest the customer contact us directly."

Return ONLY the system prompt, no other text. Keep under 600 words.`,
            }],
          }),
        })

        const aiData = await aiResponse.json()
        const systemPrompt = aiData.content?.[0]?.text || ''

        if (!systemPrompt) {
          send({ type: 'error', message: 'Could not generate system prompt. Check your Anthropic API key.' })
          controller.close()
          return
        }

        // Save to project if provided
        if (projectId) {
          await supabase
            .from('projects')
            .update({ system_prompt: systemPrompt })
            .eq('id', projectId)
        }

        send({
          type: 'complete',
          message: `✅ Done! Scanned ${scrapedPages.length} pages`,
          progress: 100,
          pagesScanned: scrapedPages.length,
          systemPrompt,
          pagesList: scrapedPages.map(p => new URL(p.url).pathname),
        })

        controller.close()
      } catch (err: any) {
        send({ type: 'error', message: `Failed to scan: ${err.message}` })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
