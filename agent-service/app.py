from flask import Flask, request, jsonify
from smolagents import ToolCallingAgent, LiteLLMModel
from tools import get_mandi_price, check_cold_storage, find_transport
import os
import re
import json
from dotenv import load_dotenv
from groq import Groq
from pydub import AudioSegment
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# llama-3.3-70b-versatile has more reliable forced tool-calling on Groq than
# gpt-oss-120b, which was intermittently returning its final answer as plain
# text instead of a proper tool call (causing a "did not call a tool" error
# even though it had actually produced a correct answer).
model = LiteLLMModel(
    model_id="groq/openai/gpt-oss-120b",
    api_key=os.getenv("GROQ_API_KEY")
)


def extract_answer_from_tool_error(error_str):
    """
    Fallback: if the model's forced tool call fails validation, Groq still
    includes the model's actual intended answer in the error message under
    "failed_generation". Pull the answer out of that JSON blob so a single
    formatting hiccup doesn't throw away a perfectly good answer.
    Returns the extracted answer string, or None if it can't be found.
    """
    match = re.search(r'"failed_generation":\s*"((?:[^"\\]|\\.)*)"', error_str)
    if not match:
        return None
    try:
        failed_generation_raw = match.group(1).encode().decode("unicode_escape")
        parsed = json.loads(failed_generation_raw)
        return parsed.get("arguments", {}).get("answer")
    except Exception:
        return None

def create_agent():
    return ToolCallingAgent(
        tools=[get_mandi_price, check_cold_storage, find_transport],
        model=model,
        max_steps=6
    )


# ---------- Crop Recommendation Endpoint ----------
@app.route("/api/agent/recommend", methods=["POST"])
def recommend():
    data = request.json

    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    commodity = data.get("commodity")
    district = data.get("district")
    weight_kg = data.get("weightKg")
    lat = data.get("lat")
    lng = data.get("lng")

    if not all([commodity, district, weight_kg, lat, lng]):
        return jsonify({
            "error": "Missing required fields: commodity, district, weightKg, lat, lng"
        }), 400

    prompt = f"""
    A farmer has {weight_kg}kg of {commodity} in {district}, Telangana at 
    coordinates ({lat}, {lng}). Decide whether they should SELL now, STORE 
    in cold storage, or TRANSPORT to a nearby mandi. Use the available tools 
    to check current prices, cold storage availability, and transport options.

    You must call the get_mandi_price, check_cold_storage, and find_transport
    tools before answering. Once you have all three results, you MUST call
    final_answer with your recommendation and a one-line reason. Do not
    respond with plain text at any step — always finish by calling final_answer.
    """

    last_error = None
    for attempt in range(2):
        try:
            agent = create_agent()
            result = agent.run(prompt)
            return jsonify({"recommendation": result})
        except Exception as e:
            last_error = str(e)
            fallback_answer = extract_answer_from_tool_error(last_error)
            if fallback_answer:
                return jsonify({"recommendation": fallback_answer})
            continue

    return jsonify({"error": f"Agent failed after retry: {last_error}"}), 500


# ---------- Voice Assistant Endpoint ----------
@app.route("/api/voice/query", methods=["POST"])
def voice_query():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file received"}), 400

    audio_file = request.files["audio"]
    webm_path = "temp_audio.webm"
    wav_path = "temp_audio.wav"
    audio_file.save(webm_path)

    try:
        # Convert WebM to WAV using ffmpeg (via pydub)
        audio = AudioSegment.from_file(webm_path)
        audio.export(wav_path, format="wav")

        with open(wav_path, "rb") as f:
            transcription = groq_client.audio.transcriptions.create(
                file=(wav_path, f.read()),
                model="whisper-large-v3",
                response_format="text"
            )

        transcribed_text = str(transcription).strip()

        if not transcribed_text:
            return jsonify({"error": "Could not understand audio"}), 400

        prompt = f"""
        A farmer asked (via voice, in their own words): "{transcribed_text}"

        If this is about a specific crop, check mandi prices, cold storage, 
        and transport options using the available tools before answering.
        If it's a general farming question, answer directly and simply.
        Keep your answer short (2-3 sentences), clear, and practical — 
        it will be read aloud to the farmer.

        You MUST end by calling final_answer with your response.
        """

        last_error = None
        for attempt in range(2):
            try:
                agent = create_agent()
                answer = agent.run(prompt)
                return jsonify({
                    "transcribed_text": transcribed_text,
                    "answer": answer
                })
            except Exception as e:
                last_error = str(e)
                fallback_answer = extract_answer_from_tool_error(last_error)
                if fallback_answer:
                    return jsonify({
                        "transcribed_text": transcribed_text,
                        "answer": fallback_answer
                    })
                continue

        return jsonify({
            "transcribed_text": transcribed_text,
            "error": f"Agent failed after retry: {last_error}"
        }), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        for path in [webm_path, wav_path]:
            if os.path.exists(path):
                os.remove(path)


# ---------- Health Check ----------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)