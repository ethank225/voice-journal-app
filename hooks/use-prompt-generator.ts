"use client"

import { useCallback } from "react"

export function usePromptGenerator() {
  const generatePromptsFromText = useCallback(async (text: string, count = 3): Promise<string[]> => {
    try {
      const res = await fetch('/api/generatePrompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      return data.prompts.slice(0, count)
    } catch (error) {
      console.error("Failed to generate prompts with Claude:", error)
      return [`What progress have you made on your project today?`] // fallback
    }
  }, [])

  return { generatePromptsFromText }
}
