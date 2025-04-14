"use client"

import { Badge } from "@/components/ui/badge"

interface JournalEntryViewProps {
  transcript: string
  sentiment?: string
  topics?: string[]
}

export function JournalEntryView({ transcript, sentiment, topics }: JournalEntryViewProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      case "neutral":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Your Journal Entry</h3>
      <div className="p-4 bg-muted rounded-lg">
        <p>{transcript}</p>
      </div>

      {sentiment && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">Sentiment:</span>
            <Badge className={getSentimentColor(sentiment)}>
              {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
            </Badge>
          </div>

          {topics && topics.length > 0 && (
            <div>
              <span className="font-medium">Topics:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {topics.map((topic) => (
                  <Badge key={topic} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
