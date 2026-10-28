import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Landmark, ShieldCheck, Building2, ShoppingCart, CreditCard, Sprout } from "lucide-react";

const iconMap = { Landmark, ShieldCheck, Building2, ShoppingCart, CreditCard, Sprout };

const colors = {
  green: { bg: "bg-green-100", text: "text-green-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
  teal: { bg: "bg-teal-100", text: "text-teal-600" },
};

function GovtSchemes() {
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/govt-schemes")
      .then((res) => res.json())
      .then((data) => setSchemes(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <p className="font-semibold text-gray-800 text-lg">Government Schemes & Benefits for You</p>
        <Link to="/schemes" className="text-sm text-green-600 font-medium">View All</Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {schemes.map((s) => {
          const Icon = iconMap[s.iconName] || Landmark;
          const c = colors[s.color] || colors.green;
          return (
            <Link
              key={s._id}
              to="/schemes"
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition block"
            >
              <div className={`${c.bg} w-10 h-10 rounded-full flex items-center justify-center mb-3`}>
                <Icon className={c.text} size={20} />
              </div>
              <p className="font-semibold text-sm text-gray-800">{s.title}</p>
              <p className={`text-xs font-medium mt-1 ${c.text}`}>{s.benefit}</p>
              <p className="text-xs text-green-600 font-medium mt-3">Learn more →</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default GovtSchemes;