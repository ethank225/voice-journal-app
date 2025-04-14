"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartTooltipItem } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { JournalEntry } from "@/hooks/use-journal-entries"

interface SentimentChartProps {
  entries: JournalEntry[]
}

export function SentimentChart({ entries }: SentimentChartProps) {
  if (entries.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        No sentiment data available for this time period
      </div>
    )
  }

  // Process sentiment data for line chart
  const sentimentMap: Record<string, number> = {
    positive: 1,
    neutral: 0,
    negative: -1,
  }

  const chartData = entries.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(),
    sentiment: sentimentMap[entry.sentiment.toLowerCase()] || 0,
    sentimentLabel: entry.sentiment,
  }))

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0) return "#22c55e" // green
    if (sentiment < 0) return "#ef4444" // red
    return "#3b82f6" // blue
  }

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            ticks={[-1, 0, 1]}
            tickFormatter={(value) => {
              if (value === 1) return "Positive"
              if (value === 0) return "Neutral"
              if (value === -1) return "Negative"
              return ""
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <ChartTooltip>
                    <ChartTooltipContent>
                      <p className="font-medium">{payload[0].payload.date}</p>
                      <ChartTooltipItem
                        name="Sentiment"
                        value={payload[0].payload.sentimentLabel}
                        color={getSentimentColor(payload[0].value as number)}
                      />
                    </ChartTooltipContent>
                  </ChartTooltip>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="sentiment"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
