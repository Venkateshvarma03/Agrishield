import { useState, useEffect } from "react";
import { Landmark } from "lucide-react";

const emptyForm = { amount: "", tenureMonths: "", purpose: "" };

// Same formula the server uses. The server's value is the one that gets saved.
function calculateEmi(amount, months, annualRate) {
  const principal = Number(amount);
  const n = Number(months);
  if (!principal || !n || principal <= 0 || n <= 0) return null;
  const r = annualRate / 12 / 100;
  if (r === 0) return Math.round(principal / n);
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

function FinanceLoansPage() {
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  const token = localStorage.getItem("token");

  const loadApplications = () => {
    fetch("http://localhost:5000/api/loan-applications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/loan-schemes")
      .then((res) => res.json())
      .then((data) => setSchemes(data));
    loadApplications();
  }, []);

  const openForm = (scheme) => {
    setSelected(scheme);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const emiPreview = selected
    ? calculateEmi(form.amount, form.tenureMonths, selected.interestRate)
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    fetch("http://localhost:5000/api/loan-applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ schemeId: selected._id, ...form }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.application) {
          setSelected(null);
          setForm(emptyForm);
          loadApplications();
        } else {
          setError(data.message || "Application failed");
        }
      })
      .catch(() => setError("Could not reach the server"))
      .finally(() => setSubmitting(false));
  };

  const handleWithdraw = (id) => {
    if (withdrawingId) return;
    setWithdrawingId(id);

    fetch(`http://localhost:5000/api/loan-applications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => loadApplications())
      .finally(() => setWithdrawingId(null));
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm";
  const rupees = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="font-semibold text-gray-800 text-lg mb-1">Finance & Loans</p>
        <p className="text-xs text-gray-400 mb-6">
          Sample loan products for demonstration. Rates and limits are not real bank offers.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {schemes.map((s) => (
            <div key={s._id} className="border border-gray-200 rounded-xl p-5">
              <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                <Landmark className="text-orange-600" size={20} />
              </div>
              <p className="font-medium text-gray-800">{s.name}</p>
              <p className="text-xs text-gray-500 mt-1">{s.provider} • {s.category}</p>
              <p className="text-sm text-gray-600 mt-3 mb-3">{s.description}</p>
              <p className="text-xs text-gray-500">
                {s.interestRate}% per year • up to {rupees(s.maxAmount)} • up to {s.maxTenureMonths} months
              </p>
              <button
                onClick={() => openForm(s)}
                className="w-full mt-4 bg-green-600 text-white text-sm py-2 rounded-lg font-medium"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="font-semibold text-gray-800 text-lg mb-4">My Applications</p>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-500">You have not applied for any loans yet.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Scheme</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Tenure</th>
                <th className="px-4 py-3 font-medium">EMI</th>
                <th className="px-4 py-3 font-medium">Purpose</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a._id} className="border-t hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3">{a.loanScheme?.name ?? "Removed"}</td>
                  <td className="px-4 py-3">{rupees(a.amount)}</td>
                  <td className="px-4 py-3">{a.tenureMonths} months</td>
                  <td className="px-4 py-3">{rupees(a.emi)}/month</td>
                  <td className="px-4 py-3">{a.purpose}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.status === "Submitted" ? (
                      <button
                        onClick={() => handleWithdraw(a._id)}
                        disabled={withdrawingId === a._id}
                        className="text-red-500 text-xs font-medium hover:underline disabled:text-gray-400"
                      >
                        {withdrawingId === a._id ? "Withdrawing..." : "Withdraw"}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
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
              <p className="font-semibold text-gray-800 text-lg">Loan Application</p>
              <p className="text-sm text-gray-500">
                {selected.name} • {selected.interestRate}% per year
              </p>
              <p className="text-xs text-gray-400">
                Max {rupees(selected.maxAmount)} • {selected.maxTenureMonths} months
              </p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input
              name="amount"
              type="number"
              min="1"
              max={selected.maxAmount}
              placeholder="Loan amount (₹)"
              value={form.amount}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              name="tenureMonths"
              type="number"
              min="1"
              max={selected.maxTenureMonths}
              placeholder="Tenure in months"
              value={form.tenureMonths}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              name="purpose"
              placeholder="Purpose (e.g. Seeds and fertilizer)"
              value={form.purpose}
              onChange={handleChange}
              required
              className={inputClass}
            />

            {emiPreview && (
              <p className="text-sm text-gray-600">
                Estimated EMI:{" "}
                <span className="font-medium text-gray-800">{rupees(emiPreview)}/month</span>
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
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default FinanceLoansPage;