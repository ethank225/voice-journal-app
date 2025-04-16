from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import whisper
import librosa
import numpy as np
import anthropic
import json
import requests
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session as OrmSession
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, Column, Integer, Float, String, Text, JSON, PickleType
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class AudioAnalysis(Base):
    __tablename__ = 'audio_analysis'

    id = Column(Integer, primary_key=True)
    transcript = Column(Text)
    sentiment = Column(String(50))
    mean_pitch = Column(Float)
    pitch_variability = Column(Float)
    mean_loudness = Column(Float)
    speaking_rate_wps = Column(Float)
    embedding = Column(PickleType)  # Stores list of floats

# SQLite DB
engine = create_engine("sqlite:///analysis.db", echo=True)
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)


embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def classify_workplace_tone_claude(transcript):
    client = anthropic.Anthropic(api_key=os.getenv("FLASKAPP"))

    prompt = f"""You are an expert communication coach and language analyst.
    Given a transcript, perform the following two tasks:

    1. Classify the speaker's tone into the following categories with percentage likelihoods that sum to 100:
    - Supportive
    - Neutral
    - Critical
    - Frustrated
    - Motivated
    - Insecure

    2. List 2–5 general topics discussed in the transcript (e.g., project planning, team dynamics, workplace stress).

    Return a JSON object in the following format:
    {{
      "tone_probabilities": {{
        "Supportive": ...,
        "Neutral": ...,
        "Critical": ...,
        "Frustrated": ...,
        "Motivated": ...,
        "Insecure": ...
      }},
      "topics": ["...", "...", "..."]
    }}

    Transcript:
    \"\"\"{transcript}\"\"\"
    """

    try:
        message = client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=300,
            temperature=0.3,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        response_text = message.content[0].text

        # Handle JSON response
        if response_text.startswith("```json"):
            response_text = response_text.strip("```json").strip("```")

        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # Try to extract JSON if it's wrapped in other text
            import re
            json_match = re.search(r'(\{.*\})', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            else:
                return {"error": "Failed to parse JSON from Claude response", "response": response_text}

    except Exception as e:
        print(f"Claude API exception: {str(e)}")
        return {
            "error": "Exception during Claude API call",
            "details": str(e)
        }

def extract_tonality_features(audio_path, transcript=None):
    y, sr = librosa.load(audio_path, sr=16000)  # Resample to 16kHz

    # === Pitch Analysis ===
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    pitch_values = []
    for i in range(pitches.shape[1]):
        idx = np.argmax(magnitudes[:, i])
        pitch = pitches[idx, i]
        if pitch > 0:
            pitch_values.append(pitch)
    mean_pitch = np.mean(pitch_values) if pitch_values else 0.0
    pitch_variability = np.std(pitch_values) if pitch_values else 0.0

    # === Loudness Analysis ===
    rms = librosa.feature.rms(y=y)[0]
    mean_loudness = float(np.mean(rms))

    # === Speaking Rate ===
    duration = librosa.get_duration(y=y, sr=sr)
    num_words = len(transcript.split()) if transcript else 0
    speaking_rate = num_words / duration if duration > 0 else 0.0

    return {
        "mean_pitch": round(mean_pitch, 2),
        "pitch_variability": round(pitch_variability, 2),
        "mean_loudness": round(mean_loudness, 4),
        "speaking_rate_wps": round(speaking_rate, 2)
    }

def get_top_k_similar_transcripts(query, embedding_model, k=5):
    query_embedding = embedding_model.encode(query).reshape(1, -1)

    session: OrmSession = Session()
    entries = session.query(AudioAnalysis).all()
    results = []

    for entry in entries:
        if entry.embedding:  # Make sure it exists
            sim = cosine_similarity([entry.embedding], query_embedding)[0][0]
            results.append((entry, sim))

    session.close()

    # Sort and return top k
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:k]

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

    #Extracts the transcript
    whisper_model = whisper.load_model("base")
    result = whisper_model.transcribe(temp_path)
    transcript = result["text"]

    #Extract tonality features
    tonality_features = extract_tonality_features(temp_path, transcript)

    sentiment = classify_workplace_tone_claude(transcript)  # Placeholder for sentiment analysis

    sentiment_values = sentiment.get('tone_probabilities', {})

    print(tonality_features)

    embedding = embedding_model.encode(transcript).tolist()

    max_tone = max(sentiment_values, key=sentiment_values.get)

    from sqlalchemy.exc import SQLAlchemyError

    try:
        session = Session()
        new_entry = AudioAnalysis(
            transcript=transcript,
            sentiment=max_tone,
            mean_pitch=tonality_features["mean_pitch"],
            pitch_variability=tonality_features["pitch_variability"],
            mean_loudness=tonality_features["mean_loudness"],
            speaking_rate_wps=tonality_features["speaking_rate_wps"],
            embedding=embedding
        )
        session.add(new_entry)
        session.commit()
        session.close()
    except SQLAlchemyError as e:
        print(f"DB Error: {e}")
        return jsonify({"error": "Failed to save to database"}), 500



    analysis = {
        "sentiment": max_tone,  # Changed to match what your React app expects
        "topics": sentiment['topics']  # Changed to match what your React app expects
    }

    # Return JSON to the Next.js server
    return jsonify({
        "transcript": transcript,
        "analysis": analysis
    })

@app.route("/rag-query", methods=["POST"])
def rag_query():
    data = request.get_json()
    query = data.get("query")

    if not query:
        return jsonify({"error": "Missing query"}), 400

    top_entries = get_top_k_similar_transcripts(query, embedding_model, k=5)

    # Build context for LLM
    context = "\n\n".join([
        f"Transcript: {entry.transcript}\nTone: {entry.sentiment}\nMean Pitch: {entry.mean_pitch}\nPitch Variability: {entry.pitch_variability}\nMean Loudness: {entry.mean_loudness}\nSpeaking Rate (wps): {entry.speaking_rate_wps}"
        for entry, _ in top_entries
    ])
    llm_prompt = f"""You're a workplace advisor offering supportive, inclusive guidance based on team conversations.

    Below are anonymous transcripts from a workplace setting. Your goal is to provide clear, practical advice that can help anyone on the team—regardless of role—respond thoughtfully to emotional patterns like frustration, disconnection, or motivation.

    Speak like a real person. Be warm and constructive, not formal. Keep it brief (under 150 words), and use bullet points for clarity.

    Context:
    {context}

    Question:
    {query}

    Answer:
    """


    # Ask Claude (or GPT)
    response = anthropic.Anthropic(api_key=os.getenv("FLASKAPP")).messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=400,
        temperature=0.4,
        messages=[{"role": "user", "content": llm_prompt}]
    )

    answer = response.content[0].text

    return jsonify({
        "answer": answer,
        "top_sources": [
            {
                "id": entry.id,
                "transcript": entry.transcript,
                "sentiment": entry.sentiment,
                "mean_pitch": entry.mean_pitch,
                "pitch_variability": entry.pitch_variability,
                "mean_loudness": entry.mean_loudness,
                "speaking_rate_wps": entry.speaking_rate_wps,
            }
            for entry, _ in top_entries
        ]
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)