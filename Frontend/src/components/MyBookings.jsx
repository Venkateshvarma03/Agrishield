import { useState, useEffect } from "react";

function MyBookings({ refreshKey = 0, onChange = () => {} }) {
  const [bookings, setBookings] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []));
  }, [refreshKey]);

  const handleCancel = (id) => {
    if (cancellingId) return;
    setCancellingId(id);
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => onChange())
      .finally(() => setCancellingId(null));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="font-semibold text-gray-800 text-lg mb-4">My Bookings</p>

      {bookings.length === 0 ? (
        <p className="text-sm text-gray-500">You have no bookings yet.</p>
      ) : (
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-500">
              <th className="px-4 py-3 font-medium">Storage</th>
              <th className="px-4 py-3 font-medium">Crop</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">To</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-t hover:bg-gray-50 text-sm">
                <td className="px-4 py-3">{b.storage?.name ?? "Removed"}</td>
                <td className="px-4 py-3">{b.cropName}</td>
                <td className="px-4 py-3">{b.quantity} Quintals</td>
                <td className="px-4 py-3">{formatDate(b.startDate)}</td>
                <td className="px-4 py-3">{formatDate(b.endDate)}</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    {b.status}
                  </span>
                </td>
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
  );
}

export default MyBookings;