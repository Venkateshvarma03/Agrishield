import { useState, useEffect } from "react";
import { Truck } from "lucide-react";

const emptyForm = { cropName: "", quantityKg: "", pickupLocation: "", distanceKm: "" };

function LogisticsPage() {
  const [transports, setTransports] = useState([]);
  const [districtFilter, setDistrictFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [bookings, setBookings] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);

  const loadTransports = () => {
    const url = districtFilter
      ? `${import.meta.env.VITE_API_URL}/api/transport?district=${districtFilter}`
      : `${import.meta.env.VITE_API_URL}/api/transport`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setTransports(data));
  };

  const loadBookings = () => {
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL}/api/transport-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []));
  };

  useEffect(loadTransports, [districtFilter]);
  useEffect(loadBookings, []);

  const openForm = (transport) => {
    setSelected(transport);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const estimatedCost =
    form.distanceKm && selected
      ? (Number(form.distanceKm) * selected.ratePerKm).toLocaleString("en-IN")
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/transport/${selected._id}/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.booking) {
          setSelected(null);
          setForm(emptyForm);
          loadTransports();
          loadBookings();
        } else {
          setError(data.message || "Booking failed");
        }
      })
      .catch(() => setError("Could not reach the server"))
      .finally(() => setSubmitting(false));
  };

  const handleCancel = (id) => {
    if (cancellingId) return;
    setCancellingId(id);
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/transport-bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        loadTransports();
        loadBookings();
      })
      .finally(() => setCancellingId(null));
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="font-semibold text-gray-800 text-lg">Logistics & Transport</p>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All districts</option>
            <option value="Warangal">Warangal</option>
            <option value="Karimnagar">Karimnagar</option>
            <option value="Adilabad">Adilabad</option>
          </select>
        </div>

        {transports.length === 0 ? (
          <p className="text-sm text-gray-500">No transport providers found for this district.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {transports.map((t) => (
              <div key={t._id} className="border border-gray-200 rounded-xl p-5">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <Truck className="text-blue-600" size={20} />
                </div>
                <p className="font-medium text-gray-800">{t.name}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{t.vehicleType} • {t.district}</p>
                <p className="text-xs text-gray-500 mb-4">
                  Capacity {t.capacityKg} kg • ₹{t.ratePerKm}/km
                </p>

                {t.available ? (
                  <button
                    onClick={() => openForm(t)}
                    className="w-full bg-green-600 text-white text-sm py-2 rounded-lg font-medium"
                  >
                    Book Now
                  </button>
                ) : (
                  <span className="block text-center text-sm text-gray-500 bg-gray-100 py-2 rounded-lg">
                    Booked
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="font-semibold text-gray-800 text-lg mb-4">My Transport Bookings</p>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-500">You have no transport bookings yet.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Crop</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Pickup</th>
                <th className="px-4 py-3 font-medium">Distance</th>
                <th className="px-4 py-3 font-medium">Est. Cost</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-t hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3">{b.transport?.name ?? "Removed"}</td>
                  <td className="px-4 py-3">{b.cropName}</td>
                  <td className="px-4 py-3">{b.quantityKg} kg</td>
                  <td className="px-4 py-3">{b.pickupLocation}</td>
                  <td className="px-4 py-3">{b.distanceKm} km</td>
                  <td className="px-4 py-3">₹{b.estimatedCost.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleCancel(b._id)}
                      disabled={cancellingId === b._id}
                      className="text-red-500 text-xs font-medium hover:underline disabled:text-gray-400"
                    >
                      {cancellingId === b._id ? "Cancelling..." : "Cancel"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-96 space-y-4">
            <div>
              <p className="font-semibold text-gray-800 text-lg">Book Transport</p>
              <p className="text-sm text-gray-500">
                {selected.name} • ₹{selected.ratePerKm}/km
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
              name="quantityKg"
              type="number"
              min="1"
              placeholder="Quantity in kg"
              value={form.quantityKg}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              name="pickupLocation"
              placeholder="Pickup location"
              value={form.pickupLocation}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              name="distanceKm"
              type="number"
              min="1"
              placeholder="Distance in km"
              value={form.distanceKm}
              onChange={handleChange}
              required
              className={inputClass}
            />

            {estimatedCost && (
              <p className="text-sm text-gray-600">
                Estimated cost: <span className="font-medium text-gray-800">₹{estimatedCost}</span>
              </p>
            )}

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

export default LogisticsPage;