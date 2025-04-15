from flask import Flask, request, jsonify
from flask_cors import CORS  # Add this import
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/analyze-audio", methods=["POST"])
def analyze_audio():
    file = request.files.get("file")  # "file" is the key we expect
    if not file:
        return jsonify({"error": "No audio file received"}), 400

    # Optional: Save the file to disk or process directly
    temp_path = "temp_audio.wav"
    file.save(temp_path)

    # --- Do your ML analysis here ---
    # e.g. transcription, sentiment, tonality, etc.
    # transcript = run_whisper(temp_path)
    # analysis = run_emotion_model(temp_path)

    # For demo:
    mock_transcript = "This is a transcribed audio sample."
    mock_analysis = {
        "sentiment": "positive",  # Changed to match what your React app expects
        "topics": ["technology", "work"]  # Changed to match what your React app expects
    }

    # Return JSON to the Next.js server
    return jsonify({
        "transcript": mock_transcript,
        "analysis": mock_analysis
    })


if __name__ == "__main__":
    # By default, Flask will run on http://localhost:5000
    app.run(host="0.0.0.0", port=5001, debug=True)