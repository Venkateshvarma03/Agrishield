import { useState, useEffect } from "react";
import {
  Landmark, ShieldCheck, Building2, ShoppingCart, CreditCard, Sprout, Search, ExternalLink, X,
} from "lucide-react";

const API = `${import.meta.env.VITE_API_URL}`;

const iconMap = { Landmark, ShieldCheck, Building2, ShoppingCart, CreditCard, Sprout };

const colors = {
  green: { bg: "bg-green-100", text: "text-green-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
  teal: { bg: "bg-teal-100", text: "text-teal-600" },
};

const statusStyle = {
  Interested: "bg-gray-100 text-gray-600",
  Applied: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
};

const STATUSES = ["Interested", "Applied", "Approved", "Rejected"];

function GovtSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { "Content-Type": "application/json", ...authHeaders };

  const loadTracking = () =>
    fetch(`${API}/api/my-schemes`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setTracking(Array.isArray(data) ? data : []));

  useEffect(() => {
    fetch(`${API}/api/govt-schemes`)
      .then((res) => res.json())
      .then((data) => setSchemes(Array.isArray(data) ? data : []));
    loadTracking();
  }, []);

  const run = (id, request) => {
    if (busyId) return;
    setBusyId(id);
    setError("");
    request()
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) setError(data.message || "Something went wrong");
      })
      .then(loadTracking)
      .catch(() => setError("Could not reach the server"))
      .finally(() => setBusyId(null));
  };

  const track = (schemeId) =>
    run(schemeId, () =>
      fetch(`${API}/api/my-schemes`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ schemeId }),
      })
    );

  const updateStatus = (id, status) =>
    run(id, () =>
      fetch(`${API}/api/my-schemes/${id}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ status }),
      })
    );

  const untrack = (id) =>
    run(id, () => fetch(`${API}/api/my-schemes/${id}`, { method: "DELETE", headers: authHeaders }));

  const trackedByScheme = {};
  tracking.forEach((t) => {
    if (t.scheme) trackedByScheme[t.scheme._id] = t;
  });

  const categories = ["All", ...new Set(schemes.map((s) => s.category))];
  const q = query.trim().toLowerCase();
  const visible = schemes.filter(
    (s) =>
      (category === "All" || s.category === category) &&
      (!q || `${s.title} ${s.description} ${s.category}`.toLowerCase().includes(q))
  );

  const selectedTracking = selected ? trackedByScheme[selected._id] : null;
  const chipClass = (active) =>
    `px-3 py-1.5 text-sm rounded-full border ${
      active
        ? "bg-green-600 text-white border-green-600"
        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
    }`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="font-semibold text-gray-800 text-lg mb-1">Government Schemes & Benefits</p>
        <p className="text-xs text-gray-400 mb-5">
          Apply on each scheme's official portal, then track your progress here. AgriShield does not submit applications to government systems.
        </p>

        <div className="flex items-center gap-4 mb-5 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search schemes"
              className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm w-64"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={chipClass(category === c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {visible.length === 0 ? (
          <p className="text-sm text-gray-500">No schemes match your search.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {visible.map((s) => {
              const Icon = iconMap[s.iconName] || Landmark;
              const c = colors[s.color] || colors.green;
              const t = trackedByScheme[s._id];
              return (
                <div
                  key={s._id}
                  className="border border-gray-200 rounded-xl p-5 flex flex-col hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${c.bg} w-11 h-11 rounded-full flex items-center justify-center`}>
                      <Icon className={c.text} size={22} />
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {s.category}
                    </span>
                  </div>

                  <p className="font-semibold text-gray-800">{s.title}</p>
                  <p className={`text-sm font-medium mt-1 ${c.text}`}>{s.benefit}</p>
                  <p className="text-sm text-gray-600 mt-3 flex-1">{s.description}</p>

                  {t && (
                    <span className={`${statusStyle[t.status]} text-xs font-medium px-3 py-1 rounded-full self-start mt-3`}>
                      Tracking: {t.status}
                    </span>
                  )}

                  <button
                    onClick={() => setSelected(s)}
                    className="w-full mt-4 bg-green-600 text-white text-sm py-2 rounded-lg font-medium"
                  >
                    View details & apply
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="font-semibold text-gray-800 text-lg mb-4">My Schemes</p>
        {tracking.length === 0 ? (
          <p className="text-sm text-gray-500">You are not tracking any schemes yet.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Scheme</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {tracking.map((t) => (
                <tr key={t._id} className="border-t hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3">{t.scheme?.title ?? "Removed"}</td>
                  <td className="px-4 py-3">{t.scheme?.category ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={t.status}
                      onChange={(e) => updateStatus(t._id, e.target.value)}
                      disabled={busyId === t._id}
                      className={`${statusStyle[t.status]} text-xs font-medium px-3 py-1 rounded-full border-0`}
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => untrack(t._id)}
                      disabled={busyId === t._id}
                      className="text-red-500 text-xs font-medium hover:underline disabled:text-gray-400"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-xs text-gray-400 mt-3">
          Statuses are set by you. They do not sync with any government system.
        </p>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-[520px] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {selected.category}
                </span>
                <p className="font-semibold text-gray-800 text-lg mt-2">{selected.title}</p>
                <p className={`text-sm font-medium ${(colors[selected.color] || colors.green).text}`}>
                  {selected.benefit}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600">{selected.description}</p>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">Who can apply</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {selected.eligibility.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">Documents usually needed</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {selected.documents.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-gray-400">
              Requirements can change. Confirm the details on the official portal before applying.
            </p>

            <div className="flex gap-3 pt-2">
              <a
                href={selected.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                Open official portal <ExternalLink size={14} />
              </a>
              {selectedTracking ? (
                <button
                  onClick={() => untrack(selectedTracking._id)}
                  disabled={busyId === selectedTracking._id}
                  className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg disabled:text-gray-400"
                >
                  Stop tracking
                </button>
              ) : (
                <button
                  onClick={() => track(selected._id)}
                  disabled={busyId === selected._id}
                  className="flex-1 border border-green-600 text-green-700 text-sm py-2 rounded-lg font-medium disabled:border-gray-300 disabled:text-gray-400"
                >
                  Track this scheme
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GovtSchemesPage;