import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Leaflet's default marker icons break under Vite, so point them at the bundled files
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MAP_CENTER = [17.9689, 79.5941]; // Warangal
const emptyForm = { cropName: "", quantity: "", startDate: "", endDate: "" };

// Zooms the map so every pin is visible
function FitToMarkers({ points }) {
  const map = useMap();
  // Only refit when the coordinates change, so typing in the booking form
  // or panning the map never makes it jump back
  const key = points.map((p) => p.join(",")).join("|");

  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);

  return null;
}

function NearbyStorage({ refreshKey = 0, onChange = () => {} }) {
  const [storages, setStorages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/storage`)
      .then((res) => res.json())
      .then((data) => setStorages(data));
  }, [refreshKey]);

  const openForm = (storage) => {
    setSelected(storage);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ storageId: selected._id, ...form }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.booking) {
          setStorages((prev) =>
            prev.map((s) => (s._id === data.storage._id ? data.storage : s))
          );
          setSelected(null);
          setForm(emptyForm);
          onChange();
        } else {
          setError(data.message || "Booking failed");
        }
      })
      .catch(() => setError("Could not reach the server"))
      .finally(() => setSubmitting(false));
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm";
  const mappable = storages.filter(
    (s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <p className="font-semibold text-gray-800 text-lg">Nearby Storage & Services</p>
        <p className="text-sm text-green-600 font-medium cursor-pointer">View All</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* relative z-0 keeps the map's layers below the booking popup */}
        <div className="relative z-0 h-80 rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={MAP_CENTER}
            zoom={12}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitToMarkers points={mappable.map((s) => [s.lat, s.lng])} />
            {mappable.map((s) => (
              <Marker key={s._id} position={[s.lat, s.lng]}>
                <Popup>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs">{s.type} • {s.capacity}</p>
                  <p className="text-xs mb-2">{s.distance} away</p>
                  {s.available ? (
                    <button
                      onClick={() => openForm(s)}
                      className="bg-green-600 text-white text-xs px-3 py-1 rounded"
                    >
                      Book Now
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">Booked</span>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="flex flex-col gap-5">
          {storages.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center border-b border-gray-100 pb-5 last:border-b-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-gray-800 mb-1">{item.name}</p>
                <p className="text-xs text-gray-500 mb-0.5">{item.distance} • {item.capacity}</p>
                <p className="text-xs text-gray-500">{item.type}</p>
              </div>

              {item.available ? (
                <button
                  onClick={() => openForm(item)}
                  className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg font-medium"
                >
                  Book Now
                </button>
              ) : (
                <span className="text-xs text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                  Booked
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-96 space-y-4">
            <div>
              <p className="font-semibold text-gray-800 text-lg">Book Storage</p>
              <p className="text-sm text-gray-500">
                {selected.name} • capacity {selected.capacity}
              </p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input
              name="cropName"
              placeholder="Crop (e.g. Paddy)"
              value={form.cropName}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              name="quantity"
              type="number"
              min="1"
              placeholder="Quantity in quintals"
              value={form.quantity}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <div>
              <label className="text-xs text-gray-500">Start date</label>
              <input
                name="startDate"
                type="date"
                min={today}
                value={form.startDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">End date</label>
              <input
                name="endDate"
                type="date"
                min={form.startDate || today}
                value={form.endDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg font-medium disabled:bg-gray-400"
              >
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default NearbyStorage;