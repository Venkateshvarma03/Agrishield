import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Sprout, Warehouse, Truck, Landmark, ShieldCheck, ShoppingCart, Users } from "lucide-react";

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const compact = (v) =>
  v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${v / 1000}k` : v;

function StatCard({ icon: Icon, label, value, sub, bg, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`${bg} w-11 h-11 rounded-full flex items-center justify-center shrink-0`}>
        <Icon className={color} size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}

function ReportsAnalytics() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/reports/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.crops) setReport(data);
        else setError(data.message || "Could not load the report");
      })
      .catch(() => setError("Could not reach the server"));
  }, []);

  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (!report) return <p className="text-sm text-gray-500">Loading report...</p>;

  const { crops, storage, transport, loans, insurance, marketplace, fpo } = report;

  const financeData = [
    { name: "Loan amount", amount: loans.totalAmount },
    { name: "Sum insured", amount: insurance.totalSumInsured },
    { name: "Premium", amount: insurance.totalPremium },
    { name: "Transport cost", amount: transport.totalCost },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-semibold text-gray-800 text-lg">Reports & Analytics</p>
        <p className="text-xs text-gray-400">
          Crop figures cover all crops in the system. Everything else is for your account only.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Sprout} bg="bg-green-100" color="text-green-600"
          label="Crops"
          value={`${crops.count} crops`}
          sub={`Estimated revenue ${rupees(crops.totalRevenue)}`}
        />
        <StatCard
          icon={Warehouse} bg="bg-blue-100" color="text-blue-600"
          label="Storage bookings"
          value={storage.bookings}
          sub={`${storage.quintalsBooked} quintals booked`}
        />
        <StatCard
          icon={Truck} bg="bg-orange-100" color="text-orange-600"
          label="Transport bookings"
          value={transport.bookings}
          sub={`Estimated cost ${rupees(transport.totalCost)}`}
        />
        <StatCard
          icon={Landmark} bg="bg-yellow-100" color="text-yellow-600"
          label="Loan applications"
          value={loans.applications}
          sub={`${rupees(loans.totalAmount)} • EMI ${rupees(loans.monthlyEmi)}/month`}
        />
        <StatCard
          icon={ShieldCheck} bg="bg-teal-100" color="text-teal-600"
          label="Insurance policies"
          value={insurance.policies}
          sub={`Cover ${rupees(insurance.totalSumInsured)} • Premium ${rupees(insurance.totalPremium)}`}
        />
        <StatCard
          icon={Users} bg="bg-purple-100" color="text-purple-600"
          label="FPO groups joined"
          value={fpo.groupsJoined}
          sub="Farmer producer organisations"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="font-semibold text-gray-800 mb-4">Estimated revenue by crop</p>
          {crops.list.length === 0 ? (
            <p className="text-sm text-gray-500">No crops to chart yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={crops.list}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={compact} />
                <Tooltip formatter={(v) => rupees(v)} />
                <Bar dataKey="revenue" name="Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="font-semibold text-gray-800 mb-4">Financial overview</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={financeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={compact} />
              <Tooltip formatter={(v) => rupees(v)} />
              <Bar dataKey="amount" name="Amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="text-green-600" size={18} />
          <p className="font-semibold text-gray-800">Marketplace activity</p>
        </div>
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-500">
              <th className="px-4 py-3 font-medium">Metric</th>
              <th className="px-4 py-3 font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-t"><td className="px-4 py-3">Listings posted</td><td className="px-4 py-3">{marketplace.listings}</td></tr>
            <tr className="border-t"><td className="px-4 py-3">Listings sold</td><td className="px-4 py-3">{marketplace.soldListings}</td></tr>
            <tr className="border-t"><td className="px-4 py-3">Offers received</td><td className="px-4 py-3">{marketplace.offersReceived}</td></tr>
            <tr className="border-t"><td className="px-4 py-3">Offers waiting for your reply</td><td className="px-4 py-3">{marketplace.pendingOffersReceived}</td></tr>
            <tr className="border-t"><td className="px-4 py-3">Offers you made</td><td className="px-4 py-3">{marketplace.offersMade}</td></tr>
            <tr className="border-t"><td className="px-4 py-3">Your offers accepted</td><td className="px-4 py-3">{marketplace.offersAccepted}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsAnalytics;