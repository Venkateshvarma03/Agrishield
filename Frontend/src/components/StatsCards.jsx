import { useState, useEffect } from "react";
import { Sprout, ShoppingBag, TrendingUp, Warehouse, Bell } from "lucide-react";
import Card from "./Card";

const rupees = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const DASH = "—";

function StatsCards() {
  const [summary, setSummary] = useState(null);
  const [alertCount, setAlertCount] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => d.activeCrops !== undefined && setSummary(d))
      .catch(() => {});

    fetch(`${import.meta.env.VITE_API_URL}/api/weather/live`)
      .then((res) => res.json())
      .then((d) => Array.isArray(d.alerts) && setAlertCount(d.alerts.length))
      .catch(() => {});
  }, []);

  const stats = [
    {
      id: 1, icon: Sprout, label: "My Crops",
      value: summary ? summary.activeCrops : DASH,
      subtext: "Active Crops", iconBg: "bg-green-100", iconColor: "text-green-600",
    },
    {
      id: 2, icon: ShoppingBag, label: "Total Quantity",
      value: summary ? summary.totalQuintals : DASH,
      subtext: "Quintals", iconBg: "bg-blue-100", iconColor: "text-blue-600",
    },
    {
      id: 3, icon: TrendingUp, label: "Est. Revenue",
      value: summary ? rupees(summary.estRevenue) : DASH,
      subtext: "Potential Earnings", iconBg: "bg-orange-100", iconColor: "text-orange-600",
    },
    {
      id: 4, icon: Warehouse, label: "Storage Booked",
      value: summary ? summary.storageBookedQuintals : DASH,
      subtext: "Quintals", iconBg: "bg-purple-100", iconColor: "text-purple-600",
    },
    {
      id: 5, icon: Bell, label: "Active Alerts",
      value: alertCount !== null ? alertCount : DASH,
      subtext: "Weather alerts", iconBg: "bg-red-100", iconColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {stats.map((s) => (
        <Card
          key={s.id}
          icon={s.icon}
          label={s.label}
          value={s.value}
          subtext={s.subtext}
          iconBg={s.iconBg}
          iconColor={s.iconColor}
        />
      ))}
    </div>
  );
}

export default StatsCards;