import { useCallback } from "react";

type PromptPayload = {
  text: string;
  name: string;
  progressInfo: string;
  fileName: string;
};

export function usePromptGenerator() {
  const generatePromptsFromText = useCallback(
    async ({ text, name, progressInfo, fileName }: PromptPayload): Promise<string[]> => {
      try {
        const res = await fetch("/api/generatePrompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, name, progressInfo, fileName }),
        });

        const data = await res.json();
        return data.prompts.slice(0, 3);
      } catch (error) {
        console.error("Failed to generate prompts:", error);
        return ["What progress have you made on your project today?"];
      }
    },
    []
  );

  return { generatePromptsFromText };
}
