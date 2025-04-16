"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { SentimentChart } from "@/components/sentiment-chart"
import { TopicsCloud } from "@/components/topics-cloud"
import { RecentEntries } from "@/components/recent-entries"
import { useJournalEntries } from "@/hooks/use-journal-entries"

export default function DashboardPage() {
  const { entries, getFilteredEntries } = useJournalEntries()
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week")
  const filteredEntries = getFilteredEntries(timeRange)

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>Track your mood and common topics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                You haven't recorded any journal entries yet.
                <a href="/journal" className="underline ml-1 font-medium">
                  Start journaling
                </a>&nbsp;
                to see your data here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Track your mood and common topics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="week" className="space-y-4" onValueChange={(value) => setTimeRange(value as any)}>
            <TabsList>
              <TabsTrigger value="week">Past Week</TabsTrigger>
              <TabsTrigger value="month">Past Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value="week" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <SentimentChart entries={filteredEntries} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Topics</CardTitle>
                </CardHeader>
                <CardContent className="min-h-64">
                  <TopicsCloud entries={filteredEntries} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="month" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <SentimentChart entries={filteredEntries} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Topics</CardTitle>
                </CardHeader>
                <CardContent className="min-h-64">
                  <TopicsCloud entries={filteredEntries} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <SentimentChart entries={filteredEntries} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Topics</CardTitle>
                </CardHeader>
                <CardContent className="min-h-64">
                  <TopicsCloud entries={filteredEntries} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <h3 className="font-medium text-lg mb-4">Recent Journal Entries</h3>
            <RecentEntries entries={entries} limit={3} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
