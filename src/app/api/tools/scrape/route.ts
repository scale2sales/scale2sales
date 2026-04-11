// @ts-nocheck
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function fetchPageText(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 7000)
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Scale2Sales-Bot/1.0)' },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`${res.status}`)
    const html = await res.text()
    const cleaned = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ').trim().slice(0, 3000)
    const links = []
    const base = new URL(url)
    for (const m of html.matchAll(/href=["']([^"'#?]+)["']/gi)) {
      try {
        const u = new URL(m[1], url)
        if (u.hostname === base.hostname && u.pathname !== '/' &&
          !u.pathname.match(/\.(pdf|jpg|png|gif|svg|css|js|zip|xml|ico)$/i) &&
          !links.includes(u.href) && links.length < 8) links.push(u.href)
      } catch {}
    }
    return { text: cleaned, links }
  } catch { clearTimeout(timeout); return { text: '', links: [] } }
}

function scorePage(url) {
  const p = url.toLowerCase()
  if (/\/(about|contact|service|product|pricing|faq|menu|help)/.test(p)) return 9
  if (/\/(team|location|hours|support)/.test(p)) return 6
  return 3
}

export async function POST(req) {
  const { url } = await req.json()
  if (!url) return new Response('Missing URL', { status: 400 })
  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }
      try {
        send({ type: 'progress', message: 'Scanning homepage...', progress: 5 })
        const { text: homeText, links } = await fetchPageText(normalizedUrl)
        if (!homeText) {
          send({ type: 'error', message: 'Could not access this website. Please check the URL.' })
          controller.close(); return
        }
        const scored = [...new Set(links)]
          .map(l => ({ url: l, score: scorePage(l) }))
          .sort((a, b) => b.score - a.score).slice(0, 4)
        send({ type: 'progress', message: `Found ${scored.length} pages`, progress: 15 })
        const pages = [{ url: normalizedUrl, text: homeText }]
        for (let i = 0; i < scored.length; i++) {
          send({ type: 'progress', message: `Scanning: ${new URL(scored[i].url).pathname}`, progress: 20 + Math.round(((i + 1) / scored.length) * 45), pagesScanned: i + 1 })
          const { text } = await fetchPageText(scored[i].url)
          if (text) pages.push({ url: scored[i].url, text })
        }
        send({ type: 'progress', message: 'Generating AI response...', progress: 75 })
        const combined = pages.map(p => `--- ${p.url} ---\n${p.text}`).join('\n\n').slice(0, 10000)
        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 800,
            messages: [{ role: 'user', content: `Create a helpful AI chatbot system prompt for this website.\n\nContent from ${pages.length} pages of ${normalizedUrl}:\n${combined}\n\nWrite a system prompt that covers: business name, services/products with prices, hours/location/contact if found, common FAQs. End with: "If you don't know something, suggest the visitor contact us directly." Under 400 words. Return ONLY the system prompt.` }],
          }),
        })
        const aiData = await aiRes.json()
        const systemPrompt = aiData.content?.[0]?.text || ''
        if (!systemPrompt) { send({ type: 'error', message: 'Could not generate AI prompt. Check your Anthropic API key.' }); controller.close(); return }
        send({ type: 'complete', message: `Scanned ${pages.length} pages!`, progress: 100, pagesScanned: pages.length, systemPrompt, pagesList: pages.map(p => new URL(p.url).pathname) })
        controller.close()
      } catch (err) { send({ type: 'error', message: `Failed: ${err.message}` }); controller.close() }
    },
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' } })
}
