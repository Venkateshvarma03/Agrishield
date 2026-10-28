import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { date: "May 20", pastPrice: 2000, predictedPrice: null },
  { date: "May 27", pastPrice: 2050, predictedPrice: null },
  { date: "Jun 03", pastPrice: 2150, predictedPrice: 2150 },
  { date: "Jun 10", pastPrice: null, predictedPrice: 2280 },
  { date: "Jun 17", pastPrice: null, predictedPrice: 2450 },
];

function PricePrediction() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-gray-800">Price Prediction (Paddy)</p>
        <p className="text-sm text-green-600 font-medium cursor-pointer">View Details</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="pastPrice"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
            name="Past Price"
          />
          <Line
            type="monotone"
            dataKey="predictedPrice"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Predicted Price"
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}

export default PricePrediction;