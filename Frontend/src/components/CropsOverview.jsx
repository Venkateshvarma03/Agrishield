import React, { useState, useEffect } from "react";
import { Wheat, Sprout, Leaf } from "lucide-react";
import AIRecommendationModal from "./AIRecommendationModal";

const cropIcons = {
  paddy: Wheat,
  Maize: Sprout,
  "Red gram": Leaf,
};

export default function CropsOverview() {
  const [crops, setCrops] = useState([]);
  const [aiCrop, setAiCrop] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/crops`)
      .then((res) => res.json())
      .then((data) => setCrops(data));
  }, []);

  const handleSell = (id) => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/crops/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "Sold" }),
    })
      .then((res) => res.json())
      .then((updatedCrop) => {
        setCrops((prevCrops) =>
          prevCrops.map((crop) =>
            crop._id === updatedCrop._id ? updatedCrop : crop
          )
        );
      });
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/crops/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setCrops((prevCrops) => prevCrops.filter((crop) => crop._id !== id));
    });
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm p-4 mt-6">

      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-gray-800">My Crops Overview</p>
        <p className="text-sm text-green-600 font-medium cursor-pointer">View All</p>
      </div>

      <table className="min-w-full text-left">
        <thead>
          <tr className="bg-gray-100 text-sm text-gray-600 w-full text-left">
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Crop</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Quantity</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Harvest Date</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Market Price</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Est. Revenue</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Status</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {crops.map((crop) => (
            <tr key={crop._id} className="border-t last:border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {cropIcons[crop.name] && (
                    <>{React.createElement(cropIcons[crop.name], { className: "text-green-600", size: 18 })}</>
                  )}
                  <span>{crop.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">{crop.quantity}</td>
              <td className="px-4 py-3">{crop.harvestDate}</td>

              <td className="px-4 py-3">
                ₹{crop.price.toLocaleString("en-IN")}{" "}
                <span className={crop.change >= 0 ? "text-green-600" : "text-red-600"}>
                  {crop.change >= 0 ? `+${crop.change}%` : `${crop.change}%`}
                </span>
              </td>

              <td className="px-4 py-3">₹{crop.EstRevenue.toLocaleString("en-IN")}</td>

              <td className="px-4 py-3">
                <span className={
                  crop.status === "Ready to Sell"
                    ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium"
                    : crop.status === "Sold"
                    ? "bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium"
                    : "bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                }>
                  {crop.status}
                </span>
              </td>

              <td className="px-4 py-3 flex flex-wrap gap-2 items-center">
                {crop.status === "Ready to Sell" ? (
                  <button
                    onClick={() => handleSell(crop._id)}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    Sell Now
                  </button>
                ) : crop.status === "Sold" ? (
                  <span className="text-xs text-gray-400">—</span>
                ) : (
                  <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                    View
                  </button>
                )}

                <button
                  onClick={() => setAiCrop(crop)}
                  className="text-green-600 text-xs font-medium hover:underline"
                >
                  Ask AI
                </button>

                <button
                  onClick={() => handleDelete(crop._id)}
                  className="text-red-500 text-xs font-medium hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {aiCrop && (
        <AIRecommendationModal crop={aiCrop} onClose={() => setAiCrop(null)} />
      )}
    </div>
  );
}