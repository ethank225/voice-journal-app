from app import Session, AudioAnalysis, embedding_model
import numpy as np
import pandas as pd

# Assume `sample_transcripts` is already generated using the previous code
# It should be a list of (transcript, tone) tuples

session = Session()
sample_transcripts = pd.read_csv("Generated_Transcript_Samples.csv").values.tolist()


# Step 1: Clear existing data
session.query(AudioAnalysis).delete()
session.commit()
print("🧹 Cleared existing AudioAnalysis entries.")

# Step 2: Insert 50 new entries
for transcript, tone in sample_transcripts:
    entry = AudioAnalysis(
        transcript=transcript,
        sentiment=tone,
        mean_pitch=round(np.random.uniform(100, 300), 2),
        pitch_variability=round(np.random.uniform(20, 80), 2),
        mean_loudness=round(np.random.uniform(0.01, 0.1), 4),
        speaking_rate_wps=round(np.random.uniform(1.5, 4.5), 2),
        embedding=embedding_model.encode(transcript).tolist()
    )
    session.add(entry)

session.commit()
session.close()
print("✅ Inserted 50 new transcripts with metrics into the database.")
