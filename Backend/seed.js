require("dotenv").config();
const mongoose = require("mongoose");
const Crop = require("./models/Crop");

const crops = [
  { name: "paddy", quantity: "20 Quintals", harvestDate: "28 May 2026", price: 2150, change: 2.4, EstRevenue: 43000, status: "Ready to Sell" },
  { name: "Maize", quantity: "15 Quintals", harvestDate: "10 jun 2026", price: 1820, change: -1.2, EstRevenue: 27300, status: "Growing" },
  { name: "Red gram", quantity: "10.6 Quintals", harvestDate: "25 jun 2026", price: 6350, change: 3.6, EstRevenue: 67410, status: "Growing" },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    await Crop.deleteMany({});      // clears any existing crops first
    await Crop.insertMany(crops);   // inserts fresh data
    console.log("Crops seeded successfully 🌱");
    mongoose.connection.close();    // closes connection when done
  })
  .catch((err) => console.log("Error ❌", err));