"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface LoadingPageProps {
  onComplete?: () => void
  title?: string
  description?: string
}

export default function LoadingPage({
  onComplete,
  title = "Generating Prompts",
  description = "Please wait while we create personalized prompts based on your project information.",
}: LoadingPageProps) {
  const [progress, setProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your project details...")

  const loadingMessages = [
    "Analyzing your project details...",
    "Creating personalized prompts...",
    "Optimizing for your goals...",
    "Finalizing your journal experience...",
    "Almost ready...",
  ]

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          if (onComplete) {
            setTimeout(onComplete, 500)
          }
          return 100
        }

        // Update loading message based on progress
        const messageIndex = Math.min(
          Math.floor((prevProgress / 100) * loadingMessages.length),
          loadingMessages.length - 1,
        )
        setLoadingMessage(loadingMessages[messageIndex])

        return prevProgress + 5
      })
    }, 300)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-muted-foreground mt-2">{description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
            </div>

            <Progress value={progress} className="w-full" />

            <p className="text-sm text-center text-muted-foreground animate-pulse">{loadingMessage}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
