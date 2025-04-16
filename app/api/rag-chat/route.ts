import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const response = await fetch("http://127.0.0.1:5001/rag-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("RAG response data:", data);

    return NextResponse.json({
      answer: data.answer,
      sources: data.top_sources || [], // Use empty array as fallback
    });
  } catch (error) {
    console.error("Error processing RAG query:", error);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}