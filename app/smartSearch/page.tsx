"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search } from "lucide-react"
import TranscriptTile from "@/components/transcript-tile"
import type { Transcript } from "@/lib/types"
import ReactMarkdown from "react-markdown"
import { Skeleton } from "@/components/ui/skeleton"

const LOCAL_STORAGE_KEYS = {
  query: "searchQuery",
  result: "searchResult",
  transcripts: "searchTranscripts",
}

// Helper function to render content including images
const ResultContent = ({ content }: { content: string }) => {
  const hasImageUrl = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i.test(content)
  if (!hasImageUrl) return <div>{content}</div>

  const parts = []
  let lastIndex = 0
  const regex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/gi
  let match

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<div key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</div>)
    }
    parts.push(
      <img
        key={`img-${match.index}`}
        src={match[0] || "/placeholder.svg"}
        alt="Response image"
        className="my-2 max-w-full rounded-md"
      />,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push(<div key={`text-${lastIndex}`}>{content.substring(lastIndex)}</div>)
  }

  return <>{parts}</>
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState("")
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load from localStorage on first render
  useEffect(() => {
    const savedQuery = localStorage.getItem(LOCAL_STORAGE_KEYS.query)
    const savedResult = localStorage.getItem(LOCAL_STORAGE_KEYS.result)
    const savedTranscripts = localStorage.getItem(LOCAL_STORAGE_KEYS.transcripts)

    if (savedQuery) setQuery(savedQuery)
    if (savedResult) setResult(savedResult)
    if (savedTranscripts) setTranscripts(JSON.parse(savedTranscripts))
  }, [])

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setResult("")
    setTranscripts([])

    try {
      const response = await fetch("/api/rag-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error("Failed to fetch results")

      const data = await response.json()
      setResult(data.answer || "")
      setTranscripts(data.sources || [])

      // Persist to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEYS.query, query)
      localStorage.setItem(LOCAL_STORAGE_KEYS.result, data.answer || "")
      localStorage.setItem(LOCAL_STORAGE_KEYS.transcripts, JSON.stringify(data.sources || []))
    } catch (error) {
      console.error("Search error:", error)
      setResult("An error occurred while searching. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Workplace Knowledge Search</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex space-x-2 max-w-2xl mx-auto">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workplace knowledge..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="min-w-[100px]">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            {isLoading ? "Searching" : "Search"}
          </Button>
        </div>
      </form>

      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="text-lg">Results</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 pt-0">
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[80%]" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-[85%]" />
                    <Skeleton className="h-4 w-[95%]" />
                    <Skeleton className="h-4 w-[75%]" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[80%]" />
                  </div>
                </div>
              </div>
            ) : result ? (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                <p>Enter a search query to see results</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:w-[350px] lg:w-[400px] flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="text-lg">Relevant Transcripts</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 pt-0">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <Skeleton className="h-4 w-[70%] mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-[90%] mb-1" />
                    <Skeleton className="h-3 w-[60%]" />
                  </div>
                ))}
              </div>
            ) : transcripts.length > 0 ? (
              <div className="space-y-3">
                {transcripts.map((transcript, index) => (
                  <TranscriptTile key={index} transcript={transcript} />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                <p>Search to see relevant transcripts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
