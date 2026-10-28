import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, ChevronDown, CloudRain, Headset } from "lucide-react";

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Stored user in Header:", storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Menu className="text-gray-600 cursor-pointer" size={22} />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, <span className="text-green-700">{user ? user.name : "Guest"}</span> 🌱
          </h2>
          <p className="text-sm text-gray-500">
            Village: Rampur, District: Warangal, Telangana
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CloudRain size={18} className="text-blue-500" />
          <span>25°C</span>
          <span className="text-gray-400">Light Rain</span>
          <span className="text-gray-400">Today</span>
        </div>

        <button className="flex items-center gap-1 border rounded-full px-3 py-1.5 text-sm text-gray-700">
          English <ChevronDown size={14} />
        </button>

        <div className="relative">
          <Bell className="text-gray-600" size={20} />
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </div>

        <div className="flex items-center gap-2">
          <img
            src="https://i.pravatar.cc/40?img=12"
            alt="profile"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="text-sm">
            <p className="font-medium text-gray-800">{user ? user.name : "Guest"}</p>
            <p className="text-xs text-gray-500">{user ? user.email : ""}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-red-500 font-medium hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Header;