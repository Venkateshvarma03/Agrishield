import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CloudRain, ThermometerSun, Wind, ShieldCheck } from "lucide-react";

// How far away is the alert date: "today", "tomorrow" or "in 3 days"
function daysAway(dateStr) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const diff = Math.round((new Date(`${dateStr}T00:00:00`) - start) / 86400000);
  if (diff <= 0) return "today";
  if (diff === 1) return "tomorrow";
  return `in ${diff} days`;
}

function AIAdvisory() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/weather/live`)
      .then((res) => res.json())
      .then((d) => (d.forecast ? setData(d) : setError(d.message || "Could not load advisory")))
      .catch(() => setError("Could not load advisory"));
  }, []);

  const alert = data?.alerts?.[0];
  const isRain = alert?.title?.includes("Rain");

  let Icon = ShieldCheck;
  if (alert) {
    if (isRain) Icon = CloudRain;
    else if (alert.title.includes("Temperature")) Icon = ThermometerSun;
    else Icon = Wind;
  }

  return (
    <div className="bg-green-50 rounded-xl border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-gray-800">AI Advisory</p>
        <Link to="/weather" className="text-sm text-green-600 font-medium">View All</Link>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {!data && !error && <p className="text-sm text-gray-500">Checking the forecast...</p>}

      {data && alert && (
        <div className="flex items-start gap-3 mt-2">
          <Icon className={isRain ? "text-blue-500" : "text-orange-500"} size={40} />
          <div>
            <p className="text-gray-800">
              <span className="font-bold">{alert.title}</span> expected{" "}
              <span className="font-bold">{daysAway(alert.date)}</span>.
            </p>
            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>

            {isRain ? (
              <Link
                to="/storage"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-medium mt-3"
              >
                Book Storage Now
              </Link>
            ) : (
              <Link
                to="/weather"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-medium mt-3"
              >
                View Forecast
              </Link>
            )}
          </div>
        </div>
      )}

      {data && !alert && (
        <div className="flex items-start gap-3 mt-2">
          <ShieldCheck className="text-green-600" size={40} />
          <div>
            <p className="text-gray-800 font-medium">No weather risks in the next 5 days.</p>
            <p className="text-sm text-gray-600 mt-1">
              Conditions look normal for {data.location}. Check market prices to decide when to sell.
            </p>
            <Link
              to="/market-prices"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-medium mt-3"
            >
              View Market Prices
            </Link>
          </div>
        </div>
      )}

      {data && (
        <p className="text-xs text-gray-400 mt-3">
          Based on the live forecast ({data.source}). Rule-based advice, not an official warning.
        </p>
      )}
    </div>
  );
}

export default AIAdvisory;