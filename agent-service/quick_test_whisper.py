from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

with open("test_audio3.webm", "rb") as f:
    transcription = client.audio.transcriptions.create(
        file=("test_audio3.webm", f.read()),
        model="whisper-large-v3",
        response_format="text"
    )

print("TRANSCRIBED TEXT:")
print(repr(transcription))