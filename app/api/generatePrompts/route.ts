// /app/api/generatePrompts/route.ts (Next.js 13+ App Router)
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text, name, progressInfo, fileName } = await req.json()


  const prompt = `
  You are a thoughtful assistant designed to generate reflective prompts that vary in tone, structure, and focus. Based on the following user details and project context, write 3 concise and insightful journaling questions. Each question should be specific to the project's goals, deliverables, and scope.

  User Name: ${name}
  Project Source: ${fileName}
  Project Guideline:
  """${text}"""
  ${progressInfo ? `
  Current Progress:
  """${progressInfo}"""
  Focus on this progress when writing prompts. Emphasize reflecting on the challenges, learnings, or milestones the user has experienced so far.
  ` : `
  No specific progress has been provided. Write prompts to encourage reflection on goals, planning, and early intentions.
  `}

  Requirements:
  - The prompts must be open-ended and reflective.
  - Each question should focus on a different angle (e.g., emotional insight, technical challenge, unexpected learning, long-term impact).
  - Vary the **style** and **structure** of each prompt. Mix direct, hypothetical, and exploratory tones.
  - **Intentionally mix up the order**—do not list similar types of prompts in sequence.

  Output:
  1.
  2.
  3.
  `;


  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-7-sonnet-20250219', // or 'sonnet', 'opus'
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
