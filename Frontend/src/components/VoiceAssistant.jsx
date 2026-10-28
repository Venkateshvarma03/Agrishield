import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

function VoiceAssistant() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    setError("");
    setTranscript("");
    setAnswer("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await sendAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      setError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setProcessing(true);
  };

  const sendAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const res = await fetch("http://localhost:5000/api/voice/query", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setTranscript(data.transcribed_text);
        setAnswer(data.answer);
        speakAnswer(data.answer);
      }
    } catch (err) {
      setError("Couldn't reach the voice assistant. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const speakAnswer = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
      <p className="font-semibold text-gray-800 mb-4">Voice Assistant</p>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={processing}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
            recording ? "bg-red-500 animate-pulse" : "bg-green-600"
          } disabled:opacity-50`}
        >
          {processing ? (
            <Loader2 className="animate-spin text-white" size={24} />
          ) : recording ? (
            <MicOff className="text-white" size={24} />
          ) : (
            <Mic className="text-white" size={24} />
          )}
        </button>

        <p className="text-sm text-gray-500">
          {recording
            ? "Listening... tap to stop"
            : processing
            ? "Thinking..."
            : "Tap to ask a question"}
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {transcript && (
          <div className="w-full bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
            <span className="font-medium">You asked: </span>{transcript}
          </div>
        )}

        {answer && (
          <div className="w-full bg-green-50 border-l-4 border-green-500 rounded-lg p-3 text-sm text-green-800">
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceAssistant;