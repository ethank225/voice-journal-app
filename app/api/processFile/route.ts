import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  const prompt = `
  You are a helpful assistant. The user has uploaded the following text as their project background. Your task is to refine the writing for clarity and structure, while preserving all specific details, lists, numbers, and key goals.

  Do NOT summarize. Instead, rewrite the content clearly and professionally, keeping all original meaning and information intact. Maintain lists, bullet points, formatting, and concrete examples wherever possible.

  Uploaded Text:
  """${text}"""

  Output a cleaned-up and clearly written version of this text that can be used as a personal project briefing.
  `

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  const data = await response.json()
  const cleanedText = data?.content?.[0]?.text?.trim() || ""
  console.log(cleanedText) // Log the cleaned text for debugging

  return NextResponse.json({ cleanedText })
}
