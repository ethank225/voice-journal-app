"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Transcript } from "@/lib/types";
import {
  BarChart2,
  Volume2,
  Mic,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TranscriptTileProps {
  transcript: Transcript;
}

export default function TranscriptTile({ transcript }: TranscriptTileProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to determine sentiment color
  const getSentimentColor = (sentiment: string | undefined | null) => {
    if (!sentiment) return "bg-gray-100 text-gray-800 border-gray-200";

    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      case "neutral":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "frustrated":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "motivated":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "supportive":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "insecure":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card
      className={cn(
        "border transition-all duration-200 hover:border-muted-foreground/20",
        isExpanded ? "shadow-md" : ""
      )}
    >
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${getSentimentColor(transcript.sentiment)}`}
          >
            {transcript.sentiment || "Unknown"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            ID: {transcript.id}
          </span>
        </div>
        <button
          className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <CardContent
        className={cn(
          "px-4 pb-3 pt-0 space-y-2 transition-all duration-300",
          !isExpanded && "pb-3"
        )}
      >
        <p
          className={cn(
            "text-sm text-foreground/90",
            isExpanded ? "" : "line-clamp-2"
          )}
        >
          {transcript.transcript}
        </p>

        <div
          className={cn(
            "grid gap-x-3 gap-y-1.5 text-xs",
            isExpanded ? "grid-cols-2" : "grid-cols-2"
          )}
        >
          <div className="flex items-center gap-1.5">
            <BarChart2 className="h-3.5 w-3.5 text-blue-500" />
            <span className="whitespace-nowrap">
              Pitch:{" "}
              {typeof transcript.mean_pitch === "number"
                ? transcript.mean_pitch.toFixed(1)
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-purple-500" />
            <span className="whitespace-nowrap">
              Var:{" "}
              {typeof transcript.pitch_variability === "number"
                ? transcript.pitch_variability.toFixed(1)
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5 text-green-500" />
            <span className="whitespace-nowrap">
              Vol:{" "}
              {typeof transcript.mean_loudness === "number"
                ? transcript.mean_loudness.toFixed(1)
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5 text-amber-500" />
            <span className="whitespace-nowrap">
              {typeof transcript.speaking_rate_wps === "number"
                ? transcript.speaking_rate_wps.toFixed(1)
                : "N/A"}{" "}
              wps
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="pt-4 border-t mt-1 mb-4 text-xs">
            <p className="font-medium mb-1 text-foreground">Analysis:</p>
            <p className="text-muted-foreground">
              This transcript shows{" "}
              <span className="font-medium">
                {transcript.sentiment?.toLowerCase() ?? "unspecified"}
              </span>{" "}
              sentiment with{" "}
              <span className="font-medium">
                {typeof transcript.pitch_variability === "number" &&
                transcript.pitch_variability > 35
                  ? "high"
                  : "moderate"}{" "}
                pitch variability
              </span>{" "}
              and
              <span className="font-medium">
                {typeof transcript.speaking_rate_wps === "number" &&
                transcript.speaking_rate_wps > 3
                  ? " fast"
                  : " moderate"}{" "}
                speaking rate
              </span>
              .
              {transcript.sentiment?.toLowerCase() === "negative" &&
                " The negative tone suggests potential concerns that may need addressing."}
              {transcript.sentiment?.toLowerCase() === "positive" &&
                " The positive tone indicates engagement and satisfaction."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
