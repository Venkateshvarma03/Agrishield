require("dotenv").config();
const mongoose = require("mongoose");
const Storage = require("./models/Storage");

const storages = [
  { name: "Shree Farmer Warehouse", distance: "2.4 km", capacity: "120 Quintals", type: "Dry Storage" },
  { name: "Warangal Cold Storage", distance: "5.7 km", capacity: "80 Quintals", type: "Cold Storage" },
  { name: "Mega Grain Storage", distance: "7.3 km", capacity: "200 Quintals", type: "Dry Storage" },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    await Storage.deleteMany({});
    await Storage.insertMany(storages);
    console.log("Storage seeded 🌱");
    mongoose.connection.close();
  })
  .catch((err) => console.log("Error ❌", err));