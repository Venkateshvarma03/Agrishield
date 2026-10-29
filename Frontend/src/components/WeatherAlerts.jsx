// import { useState, useEffect } from "react";
// import { CloudRain } from "lucide-react";

// function WeatherAlerts() {
//   const [weather, setWeather] = useState(null);

//   useEffect(() => {
//     fetch(`${import.meta.env.VITE_API_URL}/api/weather`)
//       .then((res) => res.json())
//       .then((data) => setWeather(data));
//   }, []);

//   if (!weather) return null;

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 p-4">
//       <div className="flex justify-between items-center mb-4">
//         <p className="font-semibold text-gray-800">Weather & Alerts</p>
//         <p className="text-sm text-green-600 font-medium cursor-pointer">View All</p>
//       </div>

//       <div className="flex items-center gap-2 mb-2">
//         <CloudRain className="text-blue-500" size={32} />
//         <p className="font-bold text-red-600">{weather.title}</p>
//       </div>

//       <p className="text-sm text-gray-700 mb-1">{weather.dateRange}</p>
//       <p className="text-sm text-gray-500 mb-3">{weather.description}</p>
//       <p className="text-sm text-green-600 font-medium cursor-pointer">View Details</p>
//     </div>
//   );
// }

// export default WeatherAlerts;


import { useState, useEffect } from "react";
import { CloudSun, AlertTriangle } from "lucide-react";

const levelStyle = {
  Severe: "text-red-700 bg-red-50 border-red-200",
  Warning: "text-red-600 bg-red-50 border-red-100",
  Watch: "text-yellow-700 bg-yellow-50 border-yellow-200",
};

const formatDay = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

function WeatherAlerts() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/weather/live`)
      .then((res) => res.json())
      .then((d) => (d.forecast ? setData(d) : setError(d.message || "Could not load weather")))
      .catch(() => setError("Could not load weather"));
  }, []);

  const top = data?.alerts?.[0];
  const more = data ? data.alerts.length - 1 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-gray-800">Weather & Alerts</p>
        <a href="/weather" className="text-sm text-green-600 font-medium">View All</a>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {!data && !error && <p className="text-sm text-gray-500">Loading forecast...</p>}

      {data && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <CloudSun className="text-blue-500" size={32} />
            <div>
              <p className="text-lg font-semibold text-gray-800">
                {Math.round(data.current.temperature)}°C
              </p>
              <p className="text-xs text-gray-500">
                {data.current.condition} • {data.location}
              </p>
            </div>
          </div>

          {top ? (
            <div className={`border rounded-lg p-3 ${levelStyle[top.level] || levelStyle.Watch}`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} />
                <p className="font-semibold text-sm">{top.title}</p>
              </div>
              <p className="text-xs mb-1">{formatDay(top.date)}</p>
              <p className="text-xs">{top.message}</p>
              {more > 0 && (
                <p className="text-xs mt-2 font-medium">
                  +{more} more {more === 1 ? "alert" : "alerts"}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
              No weather alerts for the next 5 days.
            </p>
          )}

          <p className="text-xs text-gray-400 mt-3">Source: {data.source}</p>
        </>
      )}
    </div>
  );
}

export default WeatherAlerts;