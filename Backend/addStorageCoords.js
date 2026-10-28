require("dotenv").config();
const mongoose = require("mongoose");
const Storage = require("./models/Storage");

// Sample positions around Warangal for the demo, not real facility addresses
const coords = [
  { name: "Shree Farmer Warehouse", lat: 17.9784, lng: 79.6005 },
  { name: "Warangal Cold Storage", lat: 17.961, lng: 79.58 },
  { name: "Mega Grain Storage", lat: 18.005, lng: 79.55 },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    for (const c of coords) {
      const result = await Storage.updateOne({ name: c.name }, { lat: c.lat, lng: c.lng });
      console.log(`${c.name}: matched ${result.matchedCount}, updated ${result.modifiedCount}`);
    }
    mongoose.connection.close();
  })
  .catch((err) => console.log("Error ❌", err));