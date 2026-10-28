require("dotenv").config();
const mongoose = require("mongoose");
const MarketPrice = require("./models/MarketPrice");

const marketPrices = [
  { commodity: "Turmeric", market: "Nizamabad", price: 8920, trend: 2.1 },
  { commodity: "Paddy", market: "Warangal", price: 2150, trend: 2.4 },
  { commodity: "Cotton", market: "Adilabad", price: 7150, trend: 1.8 },
  { commodity: "Maize", market: "Hyderabad", price: 1820, trend: -1.2 },
  { commodity: "Chilli", market: "Warangal", price: 14500, trend: -3.5 },
  { commodity: "Mango", market: "Nalgonda", price: 3200, trend: 0.8 },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    await MarketPrice.deleteMany({});
    await MarketPrice.insertMany(marketPrices);
    console.log("Market prices seeded ✅");
    process.exit();
  })
  .catch((err) => {
    console.log("Error ❌", err);
    process.exit(1);
  });