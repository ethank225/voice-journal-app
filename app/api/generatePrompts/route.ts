// /app/api/generatePrompts/route.ts (Next.js 13+ App Router)
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  const prompt = `
  You are a thoughtful assistant designed to generate reflective prompts. Based on the following project guideline, write 3 concise and insightful journaling questions. Each question should be specific to the project's goals, deliverables, and scope. The prompts should be open-ended, encourage self-reflection, and help someone track their progress, challenges, and impact throughout the project.

  Project Guideline:
  """${text}"""

  Output:
  1.
  2.
  3.
  `

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307', // or 'sonnet', 'opus'
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  const content = data?.content?.[0]?.text || ''
  console.log("Extracted content:", content) // <--- AND THIS

  const prompts = content
    .split('\n')
    .filter((line) => /^\d+\./.test(line))
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())

  return NextResponse.json({ prompts })
}
