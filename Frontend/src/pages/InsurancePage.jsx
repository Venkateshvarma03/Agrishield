import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";

const emptyForm = { cropName: "", areaAcres: "" };

const rupees = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function InsurancePage() {
  const [plans, setPlans] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const token = localStorage.getItem("token");

  const loadPolicies = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/insurance-policies`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPolicies(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/insurance-plans`)
      .then((res) => res.json())
      .then((data) => setPlans(data));
    loadPolicies();
  }, []);

  const openForm = (plan) => {
    setSelected(plan);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Preview only. The server recalculates and saves its own values.
  const area = Number(form.areaAcres);
  const sumInsuredPreview =
    selected && area > 0 ? area * selected.sumInsuredPerAcre : null;
  const premiumPreview =
    sumInsuredPreview !== null
      ? Math.round((sumInsuredPreview * selected.premiumRate) / 100)
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    fetch(`${import.meta.env.VITE_API_URL}/api/insurance-policies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planId: selected._id, ...form }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.policy) {
          setSelected(null);
          setForm(emptyForm);
          loadPolicies();
        } else {
          setError(data.message || "Enrollment failed");
        }
      })
      .catch(() => setError("Could not reach the server"))
      .finally(() => setSubmitting(false));
  };

  const handleCancel = (id) => {
    if (cancellingId) return;
    setCancellingId(id);

    fetch(`${import.meta.env.VITE_API_URL}/api/insurance-policies/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => loadPolicies())
      .finally(() => setCancellingId(null));
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="font-semibold text-gray-800 text-lg mb-1">Crop Insurance</p>
        <p className="text-xs text-gray-400 mb-6">
          Sample plans modelled on PMFBY for demonstration. Rates and amounts are illustrative.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {plans.map((p) => (
            <div key={p._id} className="border border-gray-200 rounded-xl p-5">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="text-green-600" size={20} />
              </div>
              <p className="font-medium text-gray-800">{p.name}</p>
              <p className="text-xs text-gray-500 mt-1">{p.scheme} • {p.season}</p>
              <p className="text-sm text-gray-600 mt-3 mb-3">{p.coverage}</p>
              <p className="text-xs text-gray-500">
                Premium {p.premiumRate}% • {rupees(p.sumInsuredPerAcre)} cover per acre
              </p>
              <button
                onClick={() => openForm(p)}
                className="w-full mt-4 bg-green-600 text-white text-sm py-2 rounded-lg font-medium"
              >
                Enroll
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="font-semibold text-gray-800 text-lg mb-4">My Policies</p>
        {policies.length === 0 ? (
          <p className="text-sm text-gray-500">You have no insurance policies yet.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Crop</th>
                <th className="px-4 py-3 font-medium">Area</th>
                <th className="px-4 py-3 font-medium">Sum Insured</th>
                <th className="px-4 py-3 font-medium">Premium</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3">{p.plan?.name ?? "Removed"}</td>
                  <td className="px-4 py-3">{p.cropName}</td>
                  <td className="px-4 py-3">{p.areaAcres} acres</td>
                  <td className="px-4 py-3">{rupees(p.sumInsured)}</td>
                  <td className="px-4 py-3">{rupees(p.premium)}</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleCancel(p._id)}
                      disabled={cancellingId === p._id}
                      className="text-red-500 text-xs font-medium hover:underline disabled:text-gray-400"
                    >
                      {cancellingId === p._id ? "Cancelling..." : "Cancel"}
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
              <p className="font-semibold text-gray-800 text-lg">Enroll in Insurance</p>
              <p className="text-sm text-gray-500">{selected.name}</p>
              <p className="text-xs text-gray-400">
                {selected.premiumRate}% premium • {rupees(selected.sumInsuredPerAcre)} per acre
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
              name="areaAcres"
              type="number"
              min="0.1"
              max="50"
              step="0.1"
              placeholder="Area in acres"
              value={form.areaAcres}
              onChange={handleChange}
              required
              className={inputClass}
            />

            {sumInsuredPreview !== null && (
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Sum insured:{" "}
                  <span className="font-medium text-gray-800">{rupees(sumInsuredPreview)}</span>
                </p>
                <p>
                  Premium:{" "}
                  <span className="font-medium text-gray-800">{rupees(premiumPreview)}</span>
                </p>
              </div>
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
                {submitting ? "Enrolling..." : "Enroll"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default InsurancePage;