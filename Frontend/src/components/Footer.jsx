import { Sprout, Mail, Phone, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-4">
      
      {/* Top section: 3 columns */}
      <div className="px-6 py-8 grid grid-cols-3 gap-8">
        
        {/* Column 1: Logo + tagline */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sprout className="text-green-600" size={22} />
            <p className="font-bold text-gray-800">AgriShield Network</p>
          </div>
          <p className="text-sm text-gray-500">
            Smart Agriculture. Stronger Farmers. Empowering farmers with AI-driven insights and market access.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <p className="font-semibold text-gray-800 mb-3">Quick Links</p>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500 cursor-pointer hover:text-green-600">Dashboard</p>
            <p className="text-sm text-gray-500 cursor-pointer hover:text-green-600">My Crops</p>
            <p className="text-sm text-gray-500 cursor-pointer hover:text-green-600">Storage Booking</p>
            <p className="text-sm text-gray-500 cursor-pointer hover:text-green-600">Government Schemes</p>
          </div>
        </div>

        {/* Column 3: Contact */}
        <div>
          <p className="font-semibold text-gray-800 mb-3">Contact Us</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Mail className="text-gray-400" size={16} />
              <p className="text-sm text-gray-500">support@agrishield.com</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-gray-400" size={16} />
              <p className="text-sm text-gray-500">+91 6301920396</p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-gray-400" size={16} />
              <p className="text-sm text-gray-500">Mancherial, Telangana</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar: copyright + links */}
      <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          © 2025 AgriShield Network. All rights reserved.
        </p>
        <div className="flex gap-6">
          <p className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">About Us</p>
          <p className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">Privacy Policy</p>
          <p className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">Terms & Conditions</p>
        </div>
      </div>

    </footer>
  );
}

export default Footer;