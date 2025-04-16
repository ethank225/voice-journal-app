// /app/api/generatePrompts/route.ts (Next.js 13+ App Router)
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  console.log("Received request to generate prompts") // <--- AND THIS
  const { text, name, progressInfo, fileName } = await req.json()

  const promptTypes = [
    {
      label: "Emotional Insight",
      instruction: "Ask a question that encourages ${name} to reflect on their emotional journey or motivation behind the project.",
    },
    {
      label: "Technical Challenge",
      instruction: "Pose a prompt that explores technical hurdles or implementation details related to the project's progress.",
    },
    {
      label: "Unexpected Learning",
      instruction: "Create a prompt that helps ${name} unpack any surprising discoveries or shifts in thinking.",
    },
    {
      label: "Long-Term Impact",
      instruction: "Encourage reflection on how this project might influence future work, values, or direction.",
    }
  ];

  // Shuffle and get 3 prompt types
  const shuffledPromptTypes = promptTypes.sort(() => 0.5 - Math.random()).slice(0, 3);

  // Build the instruction string from shuffled types
  const promptInstructions = shuffledPromptTypes.map((type, idx) => `Prompt ${idx + 1} (${type.label}): ${type.instruction}`).join("\n");

  const prompt = `
  You are a thoughtful assistant designed to generate reflective prompts that vary in tone, structure, and focus. Based on the following user details and project context, write 3 concise and insightful journaling questions. Each question should be specific to the project's goals, deliverables, and scope.

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

  Prompt Instructions:
  ${promptInstructions}

  Return exactly 3 prompts.

  1.
  2.
  3.
  `;



  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
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
  console.log(prompts)

  return NextResponse.json({ prompts })
}
