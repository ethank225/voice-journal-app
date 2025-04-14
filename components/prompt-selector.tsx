"use client"

interface PromptSelectorProps {
  prompts: string[]
  onSelect: (index: number) => void
  selectedIndex: number
}

export function PromptSelector({ prompts, onSelect, selectedIndex }: PromptSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Select a prompt to respond to:</h3>
      {prompts.map((prompt, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            selectedIndex === index ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => onSelect(index)}
        >
          <p className="font-medium">{prompt}</p>
        </div>
      ))}
    </div>
  )
}
