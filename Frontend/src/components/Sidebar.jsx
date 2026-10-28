import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Sprout, TrendingUp, CloudSun, Warehouse,
  ShoppingCart, Truck, Landmark, Building2, ShieldCheck,
  Users, BarChart3, Settings, Headset
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "My Crops", icon: Sprout, path: "/my-crops" },
  { name: "Market Prices", icon: TrendingUp, path: "/market-prices" },
  { name: "Weather & Alerts", icon: CloudSun, path: "/weather" },
  { name: "Storage Booking", icon: Warehouse, path: "/storage" },
  { name: "Marketplace", icon: ShoppingCart, path: "/marketplace" },
  { name: "Logistics", icon: Truck, path: "/logistics" },
  { name: "Finance & Loans", icon: Landmark, path: "/finance" },
  { name: "Government Schemes", icon: Building2, path: "/schemes" },
  { name: "Insurance", icon: ShieldCheck, path: "/insurance" },
  { name: "FPO / Groups", icon: Users, path: "/fpo" },
  { name: "Reports & Analytics", icon: BarChart3, path: "/reports" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#0f3d24] text-white h-screen overflow-y-auto flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="p-5 border-b border-green-800">
          <div className="flex items-center gap-2">
            <Sprout className="text-green-400" size={28} />
            <div>
              <h1 className="text-lg font-bold leading-tight">AgriShield</h1>
              <p className="text-sm text-gray-300 -mt-1">Network</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Smart Agriculture. Stronger Farmers.</p>
        </div>

        {/* Menu */}
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    isActive
                      ? "bg-green-600 text-white font-medium"
                      : "text-gray-300 hover:bg-green-800/50"
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom help box */}
      <div className="p-4 pb-8">
        <div className="bg-green-800/50 rounded-lg p-4 text-center">
          <Headset className="mx-auto mb-2 text-green-300" size={24} />
          <p className="text-sm font-medium">Need Help?</p>
          <p className="text-xs text-gray-300 mb-3">Talk to our assistant</p>
          <button className="bg-green-500 hover:bg-green-600 w-full py-2 rounded-md text-sm font-medium">
            Chat Now
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;