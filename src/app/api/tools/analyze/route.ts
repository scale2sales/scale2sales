// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { url, content, pagesScanned } = await req.json()
  if (!content) return NextResponse.json({ error: 'No content provided' }, { status: 400 })

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Analyze this website content and provide a detailed report. Website: ${url}

Content extracted from ${pagesScanned} pages:
${content}

Return a JSON object with this exact structure:
{
  "scores": [
    {"label": "Overall Score", "value": <0-100>, "sublabel": "<one word>"},
    {"label": "Content Quality", "value": <0-100>, "sublabel": "<one word>"},
    {"label": "Customer Focus", "value": <0-100>, "sublabel": "<one word>"}
  ],
  "fullAnalysis": "<detailed markdown analysis with these sections: ## Business Summary, ## Strengths, ## Content Gaps, ## Customer Communication, ## Top 5 Improvements>"
}

Be specific and actionable. Return ONLY the JSON, no other text.`,
        }],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text || ''

    try {
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
