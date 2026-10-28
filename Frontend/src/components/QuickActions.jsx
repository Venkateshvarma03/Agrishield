import { ShoppingBasket, Warehouse, TrendingUp, CloudSun, Truck, Landmark, ShieldCheck, Building2 } from "lucide-react";

const actions = [
  { id: 1, label: "Sell My Crop", icon: ShoppingBasket, iconBg: "bg-green-100", iconColor: "text-green-600" },
  { id: 2, label: "Book Storage", icon: Warehouse, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { id: 3, label: "Check Prices", icon: TrendingUp, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { id: 4, label: "Weather Forecast", icon: CloudSun, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { id: 5, label: "Transport Booking", icon: Truck, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { id: 6, label: "Apply Loan", icon: Landmark, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
  { id: 7, label: "Crop Insurance", icon: ShieldCheck, iconBg: "bg-green-100", iconColor: "text-green-600" },
  { id: 8, label: "Government Schemes", icon: Building2, iconBg: "bg-teal-100", iconColor: "text-teal-600" },
];

function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="font-semibold text-gray-800 mb-4">Quick Actions</p>
      <div className="grid grid-cols-4 gap-6">
        {actions.map((action) => (
          <button
            key={action.id}
            className="flex flex-col items-center gap-2 p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <div className={`${action.iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
              <action.icon className={action.iconColor} size={22} />
            </div>
            <span className="text-sm text-gray-700 text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;