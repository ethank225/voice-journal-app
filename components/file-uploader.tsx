"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void
  className?: string
}

export function FileUploader({ onFileContent, className = "" }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState("")
  const [filePreview, setFilePreview] = useState("")

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = (file: File) => {
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        const content = event.target.result as string
        setFilePreview(content)
        onFileContent(content, file.name)
      }
    }

    if (
      file.type === "text/plain" ||
      file.type === "application/json" ||
      file.type === "text/markdown" ||
      file.name.endsWith(".md") ||
      file.type === "application/pdf" ||
      file.type.includes("document")
    ) {
      reader.readAsText(file)
    } else {
      alert("Please upload a text file (txt, json, md, pdf, or document)")
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]
        processFile(file)
      }
    },
    [onFileContent],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFileName("")
    setFilePreview("")
    onFileContent("", "")
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <UploadIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm font-medium mb-1">Drag and drop your file here, or click to browse</p>
        <p className="text-xs text-muted-foreground">Supports text files, markdown, JSON, and documents</p>
        <Input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".txt,.md,.json,.docx,.pdf"
          onChange={handleFileChange}
        />
      </div>

      {fileName && (
        <div className="flex items-center justify-between p-2 mt-2 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <FileIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{fileName}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearFile}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {filePreview && (
        <div className="mt-2">
          <Label>Preview</Label>
          <div className="p-3 bg-muted rounded-md mt-1 text-sm max-h-32 overflow-y-auto">
            {filePreview.substring(0, 300)}
            {filePreview.length > 300 && "..."}
          </div>
        </div>
      )}
    </div>
  )
}
