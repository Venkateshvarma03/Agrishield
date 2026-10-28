import { useEffect, useState } from "react";

const fallbackPrices = [
  { commodity: "Paddy", market: "Warangal", price: 2150, trend: 2.4 },
  { commodity: "Maize", market: "Hyderabad", price: 1820, trend: -1.2 },
  { commodity: "Red Gram", market: "Khammam", price: 6350, trend: 3.6 },
];

function MarketPrices() {
  const [prices, setPrices] = useState(fallbackPrices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("http://localhost:5000/api/market-prices")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch market prices");
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setPrices(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPrices(fallbackPrices);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-gray-800">Market Prices</p>
        <p className="text-sm text-green-600 font-medium">Updated today</p>
      </div>

      <table className="min-w-full text-left">
        <thead>
          <tr className="bg-gray-100 text-sm text-gray-600">
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Commodity</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Market</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Price</th>
            <th className="px-4 py-3 text-sm text-gray-500 font-medium">Trend</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((item, index) => {
            const commodity = item.commodity ?? "—";
            const market = item.market ?? "—";
            const price = item.price ?? 0;
            const trend = item.trend ?? 0;

            return (
              <tr key={`${commodity}-${market}-${index}`} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{commodity}</td>
                <td className="px-4 py-3">{market}</td>
                <td className="px-4 py-3">₹{Number(price).toLocaleString("en-IN")}</td>
                <td className={`px-4 py-3 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {trend >= 0 ? "+" : ""}{trend}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {loading && (
        <p className="mt-3 text-sm text-gray-500">Loading market data...</p>
      )}
    </div>
  );
}

export default MarketPrices;