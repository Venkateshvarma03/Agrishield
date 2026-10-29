import { useState } from "react";
import { Sparkles } from "lucide-react";

function AIRecommendationModal({ crop, onClose }) {
  const [district, setDistrict] = useState("Warangal");
  const [weightKg, setWeightKg] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setResult("");
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/agent/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        commodity: crop.name,
        district,
        weightKg: Number(weightKg),
        lat: 17.9689,
        lng: 79.5941,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.recommendation) {
          setResult(data.recommendation);
        } else {
          setError(data.error || "Could not get a recommendation");
        }
      })
      .catch(() => setError("Could not reach the server"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[420px] space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-green-600" size={20} />
          <p className="font-semibold text-gray-800 text-lg">AI Recommendation</p>
        </div>
        <p className="text-sm text-gray-500">
          Crop: <span className="font-medium text-gray-700">{crop.name}</span>
        </p>

        {!result && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="District (e.g. Warangal)"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="Quantity in kg"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg font-medium disabled:bg-gray-400"
              >
                {loading ? "Thinking..." : "Ask AI"}
              </button>
            </div>
          </form>
        )}

        {result && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 bg-green-50 border border-green-100 rounded-lg p-3">
              {result}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white text-sm py-2 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIRecommendationModal;