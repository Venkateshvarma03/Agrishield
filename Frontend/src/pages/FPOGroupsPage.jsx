import { useState, useEffect } from "react";
import { Users } from "lucide-react";

function FPOGroupsPage() {
  const [fpos, setFpos] = useState([]);
  const [district, setDistrict] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadFpos = () => {
    fetch("http://localhost:5000/api/fpos", { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setFpos(Array.isArray(data) ? data : []));
  };

  useEffect(loadFpos, []);

  const toggleMembership = (fpo) => {
    if (busyId) return;
    setBusyId(fpo._id);
    setError("");

    const url = `http://localhost:5000/api/fpos/${fpo._id}/${fpo.joined ? "leave" : "join"}`;

    fetch(url, {
      method: fpo.joined ? "DELETE" : "POST",
      headers: authHeaders,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message && /already|not a member|Could not/.test(data.message)) {
          setError(data.message);
        }
        loadFpos();
      })
      .catch(() => setError("Could not reach the server"))
      .finally(() => setBusyId(null));
  };

  const districts = [...new Set(fpos.map((f) => f.district))];
  const visible = district ? fpos.filter((f) => f.district === district) : fpos;
  const myGroups = fpos.filter((f) => f.joined);

  const chip = "bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-1">
          <p className="font-semibold text-gray-800 text-lg">FPO / Groups</p>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Sample Farmer Producer Organisations for demonstration. Member counts show people who joined through AgriShield.
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {visible.length === 0 ? (
          <p className="text-sm text-gray-500">No groups found for this district.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {visible.map((f) => (
              <div key={f._id} className="border border-gray-200 rounded-xl p-5">
                <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <Users className="text-purple-600" size={20} />
                </div>
                <p className="font-medium text-gray-800">{f.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {f.district} • {f.memberCount} {f.memberCount === 1 ? "member" : "members"}
                </p>
                <p className="text-sm text-gray-600 mt-3">{f.description}</p>

                <p className="text-xs text-gray-500 mt-3 mb-1">Crops</p>
                <div className="flex flex-wrap gap-2">
                  {f.crops.map((c) => (
                    <span key={c} className={chip}>{c}</span>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-3 mb-1">Services</p>
                <div className="flex flex-wrap gap-2">
                  {f.services.map((s) => (
                    <span key={s} className={chip}>{s}</span>
                  ))}
                </div>

                <button
                  onClick={() => toggleMembership(f)}
                  disabled={busyId === f._id}
                  className={`w-full mt-4 text-sm py-2 rounded-lg font-medium disabled:bg-gray-400 disabled:text-white ${
                    f.joined
                      ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {busyId === f._id ? "Please wait..." : f.joined ? "Leave Group" : "Join Group"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="font-semibold text-gray-800 text-lg mb-4">My Groups</p>
        {myGroups.length === 0 ? (
          <p className="text-sm text-gray-500">You have not joined any groups yet.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Group</th>
                <th className="px-4 py-3 font-medium">District</th>
                <th className="px-4 py-3 font-medium">Services</th>
                <th className="px-4 py-3 font-medium">Members</th>
              </tr>
            </thead>
            <tbody>
              {myGroups.map((f) => (
                <tr key={f._id} className="border-t hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3">{f.name}</td>
                  <td className="px-4 py-3">{f.district}</td>
                  <td className="px-4 py-3">{f.services.join(", ")}</td>
                  <td className="px-4 py-3">{f.memberCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default FPOGroupsPage;