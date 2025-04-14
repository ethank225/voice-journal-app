"use client"

import type { JournalEntry } from "@/hooks/use-journal-entries"

interface TopicsCloudProps {
  entries: JournalEntry[]
}

export function TopicsCloud({ entries }: TopicsCloudProps) {
  if (entries.length === 0) {
    return <div className="flex justify-center items-center h-64 text-muted-foreground">No topics data available</div>
  }

  // Process topics for word cloud
  const topicsCount: Record<string, number> = {}
  entries.forEach((entry) => {
    entry.topics.forEach((topic) => {
      topicsCount[topic] = (topicsCount[topic] || 0) + 1
    })
  })

  const cloudData = Object.entries(topicsCount).map(([text, value]) => ({
    text,
    value,
  }))

  // Sort by value (frequency) in descending order
  const sortedData = [...cloudData].sort((a, b) => b.value - a.value)

  // Take top 20 topics
  const topTopics = sortedData.slice(0, 20)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
      {topTopics.map((item) => (
        <div
          key={item.text}
          className="bg-muted rounded-md p-2 text-center"
          style={{
            fontSize: `${Math.max(0.8, Math.min(1.5, 0.8 + item.value / 5))}rem`,
            opacity: Math.max(0.6, Math.min(1, 0.6 + item.value / 10)),
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  )
}
