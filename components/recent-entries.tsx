"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { JournalEntry } from "@/hooks/use-journal-entries"

interface RecentEntriesProps {
  entries: JournalEntry[]
  limit?: number
}

export function RecentEntries({ entries, limit = 3 }: RecentEntriesProps) {
  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)

  if (recentEntries.length === 0) {
    return <div className="text-muted-foreground text-center py-4">No journal entries yet</div>
  }

  return (
    <div className="space-y-4">
      {recentEntries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium">
                {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString()}
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  entry.sentiment.toLowerCase() === "positive"
                    ? "bg-green-100 text-green-800"
                    : entry.sentiment.toLowerCase() === "negative"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                }`}
              >
                {entry.sentiment}
              </div>
            </div>
            {entry.prompt && <div className="text-xs text-muted-foreground mb-1 italic">Prompt: {entry.prompt}</div>}
            <p className="text-sm text-muted-foreground line-clamp-3">{entry.transcript}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.topics.map((topic) => (
                <span key={topic} className="text-xs bg-muted px-2 py-1 rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
