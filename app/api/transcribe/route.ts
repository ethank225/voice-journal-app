import { NextRequest, NextResponse } from "next/server"

// We disable the built-in body parser so we can handle form data ourselves:
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // 1. Parse the incoming FormData from the browser
    const formData = await req.formData()
    const file = formData.get("audio") as File
    if (!file) {
      return NextResponse.json({ error: "No audio file received" }, { status: 400 })
    }

    // 2. Forward this file to the Flask endpoint
    //    e.g., http://localhost:5000/analyze-audio
    //    Make sure your Flask server is running on port 5000.

    const flaskUrl = "http://localhost:5001/analyze-audio"

    // 3. Create a new FormData for the Flask request
    const flaskFormData = new FormData()
    // The key "file" should match what Flask expects (app.route).
    // The last argument is the filename, e.g. "recording.wav"
    flaskFormData.append("file", file, file.name || "recording.wav")

    // 4. Make a fetch request to Flask
    const response = await fetch(flaskUrl, {
      method: "POST",
      body: flaskFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: 500 })
    }

    // 5. Parse the JSON from the Flask response
    const data = await response.json()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error("Error in transcribe route:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
