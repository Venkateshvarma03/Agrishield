import { useState, useEffect } from "react";

function LiveMarketPrices() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/live-market-prices")
      .then((res) => res.json())
      .then((data) => setPrices(data));
  }, []);

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm p-4 mt-6">
      <p className="font-semibold text-gray-800 mb-4">Live Market Prices (Telangana)</p>
      <table className="min-w-full text-left">
        <thead>
          <tr className="bg-gray-100 text-sm text-gray-600">
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Commodity</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Market</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">District</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Modal Price</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((item, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3">{item.Commodity}</td>
              <td className="px-4 py-3">{item.Market}</td>
              <td className="px-4 py-3">{item.District}</td>
              <td className="px-4 py-3">₹{item.Modal_Price}</td>
              <td className="px-4 py-3">{item.Arrival_Date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LiveMarketPrices;