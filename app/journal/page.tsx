"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { PromptSelector } from "@/components/prompt-selector"
import { VoiceRecorder } from "@/components/voice-recorder"
import { JournalEntryView } from "@/components/journal-entry-view"
import { usePromptGenerator } from "@/hooks/use-prompt-generator"
import { useJournalEntries } from "@/hooks/use-journal-entries"

export default function JournalPage() {
  const router = useRouter()
  const { generatePromptsFromText } = usePromptGenerator()
  const { addEntry } = useJournalEntries()

  const [transcript, setTranscript] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false)
  const [error, setError] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0)
  const [analysis, setAnalysis] = useState<{ sentiment: string; topics: string[] } | null>(null)

  const [userData, setUserData] = useState<{
    name: string
    projectInfo: string
    progressInfo?: string
    fileName?: string
  } | null>(null)

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData")
    if (!storedUserData) {
      router.push("/")
      return
    }

    const parsedUserData = JSON.parse(storedUserData)
    setUserData(parsedUserData)

    const storedPrompts = sessionStorage.getItem("prompts")
    if (storedPrompts) {
      const parsedPrompts = JSON.parse(storedPrompts)
      setPrompts(parsedPrompts)
    } else {
      // First time: auto-generate prompts
      ;(async () => {
        setIsGeneratingPrompts(true)
        const generatedPrompts = await generatePromptsFromText({
          text: parsedUserData.projectInfo,
          name: parsedUserData.name,
          progressInfo: parsedUserData.progressInfo || "",
          fileName: parsedUserData.fileName || "",
        })
        setPrompts(generatedPrompts)
        sessionStorage.setItem("prompts", JSON.stringify(generatedPrompts))
        setIsGeneratingPrompts(false)
      })()
    }
  }, [router, generatePromptsFromText])

  const handleGeneratePrompts = async () => {
    if (!userData) return
    setIsGeneratingPrompts(true)
    const generatedPrompts = await generatePromptsFromText({
      text: userData.projectInfo,
      name: userData.name,
      progressInfo: userData.progressInfo || "",
      fileName: userData.fileName || "",
    })
    setPrompts(generatedPrompts)
    setSelectedPromptIndex(0)
    sessionStorage.setItem("prompts", JSON.stringify(generatedPrompts))
    setIsGeneratingPrompts(false)
  }

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setError("")
    setTranscript("")
    setAnalysis(null)
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockTranscript =
        "Today I'm feeling quite energetic and positive about my health goals. I managed to exercise three times this week and I've been eating better. I still struggle with consistency sometimes, but I'm making progress."
      setTranscript(mockTranscript)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockAnalysis = {
        sentiment: "positive",
        topics: ["health", "exercise", "consistency", "progress"],
      }

      setAnalysis(mockAnalysis)

      addEntry({
        prompt: prompts[selectedPromptIndex],
        transcript: mockTranscript,
        sentiment: mockAnalysis.sentiment,
        topics: mockAnalysis.topics,
      })
    } catch (err) {
      console.error("Error processing recording:", err)
      setError("Failed to process your recording. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!userData) {
    return <div className="flex justify-center items-center h-[80vh]">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Journalyze</CardTitle>
          <CardDescription>Record your thoughts about today's prompt</CardDescription>
        </CardHeader>
        <CardContent>
          {userData && (
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">Today's prompt</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGeneratePrompts}
                disabled={isGeneratingPrompts}
              >
                {isGeneratingPrompts ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-t-transparent border-gray-500 animate-spin rounded-full"></span>
                    Generating...
                  </div>
                ) : (
                  "Refresh Prompts"
                )}
              </Button>
            </div>
          )}

          {prompts.length > 0 && (
            <PromptSelector
              prompts={prompts}
              selectedIndex={selectedPromptIndex}
              onSelect={setSelectedPromptIndex}
            />
          )}

          {isGeneratingPrompts && (
            <p className="text-sm text-muted-foreground mt-2">Generating thoughtful prompts...</p>
          )}

          <VoiceRecorder onRecordingComplete={handleRecordingComplete} isProcessing={isLoading} />

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {transcript && (
            <div className="mt-6">
              <JournalEntryView
                transcript={transcript}
                sentiment={analysis?.sentiment}
                topics={analysis?.topics}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={() => router.push("/dashboard")} disabled={isLoading}>
            View Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
