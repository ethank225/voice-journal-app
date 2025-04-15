"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  InfoIcon,
  Loader2,
  PencilIcon,
} from "lucide-react";
import { FileUploader } from "@/components/file-uploader";
import LoadingPage from "@/components/loading-page";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [projectInfo, setProjectInfo] = useState("");
  const [progressInfo, setProgressInfo] = useState("");
  const [fileName, setFileName] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      if (parsedData.name && parsedData.projectInfo) {
        setIsComplete(true);
        setName(parsedData.name);
        setProjectInfo(parsedData.projectInfo);
        setProgressInfo(parsedData.progressInfo || "");
        if (parsedData.fileName) {
          setFileName(parsedData.fileName);
        }
      }
    }
  }, []);

  const handleFileContent = async (content: string, name: string) => {
    try {
      setIsProcessingFile(true);
      const res = await fetch("/api/processFile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      });

      if (!res.ok) throw new Error("Claude API failed");

      const data = await res.json();
      const cleaned = data.cleanedText || content;

      setProjectInfo(cleaned);
      setFileName(name);
    } catch (err) {
      console.error("Failed to process file with Claude:", err);
      setProjectInfo(content);
      setFileName(name);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProjectInfo(e.target.value);
    setFileName("");
  };

  const handleProgressInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProgressInfo(e.target.value);
  };

  const handleSubmit = async () => {
    if (!name || !projectInfo) return;

    const userData = {
      name,
      projectInfo,
      progressInfo,
      fileName,
    };

    localStorage.setItem("userData", JSON.stringify(userData));
    setShowLoading(true); // Show loading screen

    try {
      const res = await fetch("/api/generatePrompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectInfo }),
      });

      if (!res.ok) throw new Error("Failed to generate prompts");

      const { prompts } = await res.json();
      localStorage.setItem("prompts", JSON.stringify(prompts));
    } catch (error) {
      console.error("Prompt generation error:", error);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("userData");
    setName("");
    setProjectInfo("");
    setProgressInfo("");
    setFileName("");
    setIsComplete(false);
    setIsEditing(false);
    setIsExpanded(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsExpanded(true);
  };

  const handleSaveChanges = () => {
    localStorage.setItem(
      "userData",
      JSON.stringify({
        name,
        projectInfo,
        progressInfo,
        fileName,
      })
    );
    setIsEditing(false);
  };

  // Show the loading screen while generating prompts
  if (showLoading) {
    return <LoadingPage onComplete={() => router.push("/journal")} />;
  }

  if (isComplete && !isEditing) {
    return (
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Welcome back, {name}!</CardTitle>
          <CardDescription>
            You've already completed onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Your project information</Label>
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2 p-3 bg-muted rounded-md">
              <span className="text-sm font-medium">
                {fileName || "Entered Manually"}
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <div
                className={`whitespace-pre-wrap break-words rounded-md p-3 bg-muted text-sm text-muted-foreground ${
                  isExpanded ? "" : "line-clamp-3"
                }`}
              >
                {projectInfo}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUpIcon className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-4 w-4 mr-1" />
                    Show More
                  </>
                )}
              </Button>
            </div>

            {progressInfo && (
              <div className="space-y-2 mt-4">
                <Label>Current Progress</Label>
                <div className="mt-2 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  {progressInfo}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset Onboarding
          </Button>
          <Button onClick={handleSubmit}>
            Update Prompts
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Your Information" : "Welcome to Journalyze"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update your project details and progress"
            : "Upload your project plans or type your goals to get started."}
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

        {!isEditing && <FileUploader onFileContent={handleFileContent} />}

        {isProcessingFile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing file with Claude...
          </div>
        )}

        {(!fileName || isEditing) && !isProcessingFile && (
          <>
            {!isEditing && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  If you don't have a file, you can also type your project
                  information.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="project-info">Project Information</Label>
              <textarea
                id="project-info"
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-center"
                placeholder="Enter your goals or project background..."
                value={projectInfo}
                onChange={handleManualInput}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="progress-info">Current Progress (Optional)</Label>
          <textarea
            id="progress-info"
            className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
            placeholder="Describe the current state of your project or progress made so far..."
            value={progressInfo}
            onChange={handleProgressInput}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={!name || !projectInfo || isProcessingFile}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!name || !projectInfo || isProcessingFile}
          >
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
