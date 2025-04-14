"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, Loader2 } from "lucide-react"
import { FileUploader } from "@/components/file-uploader"

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [projectInfo, setProjectInfo] = useState("")
  const [fileName, setFileName] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      const parsedData = JSON.parse(userData)
      if (parsedData.name && parsedData.projectInfo) {
        setIsComplete(true)
        setName(parsedData.name)
        setProjectInfo(parsedData.projectInfo)
        if (parsedData.fileName) {
          setFileName(parsedData.fileName)
        }
      }
    }
  }, [])

  const handleFileContent = async (content: string, name: string) => {
    try {
      setIsProcessingFile(true)

      const res = await fetch("/api/processFile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      })

      if (!res.ok) throw new Error("Claude API failed")

      const data = await res.json()
      const cleaned = data.cleanedText || content

      setProjectInfo(cleaned)
      setFileName(name)
    } catch (err) {
      console.error("Failed to process file with Claude:", err)
      setProjectInfo(content)
      setFileName(name)
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleManualInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProjectInfo(e.target.value)
    setFileName("")
  }

  const handleSubmit = () => {
    if (!name || !projectInfo) return

    localStorage.setItem(
      "userData",
      JSON.stringify({
        name,
        projectInfo,
        fileName,
      }),
    )
    router.push("/journal")
  }

  const handleReset = () => {
    localStorage.removeItem("userData")
    setName("")
    setProjectInfo("")
    setFileName("")
    setIsComplete(false)
  }

  if (isComplete) {
    return (
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Welcome back, {name}!</CardTitle>
          <CardDescription>You’ve already completed onboarding.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Your project information</Label>
            <div className="flex items-center gap-2 mt-2 p-3 bg-muted rounded-md">
              <span className="text-sm font-medium">
                {fileName || "Entered Manually"}
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {projectInfo.substring(0, 150)}...
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset Onboarding
          </Button>
          <Button onClick={() => router.push("/journal")}>Continue to Journal</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Welcome to Voice Journal</CardTitle>
        <CardDescription>
          Upload your project plans or type your goals to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <FileUploader onFileContent={handleFileContent} />

        {isProcessingFile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing file with Claude...
          </div>
        )}

        {!fileName && !isProcessingFile && (
          <>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                If you don’t have a file, you can also type your project information.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="project-info">Project Information</Label>
              <textarea
                id="project-info"
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                placeholder="Enter your goals or project background..."
                value={projectInfo}
                onChange={handleManualInput}
              />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!name || !projectInfo || isProcessingFile}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
}
