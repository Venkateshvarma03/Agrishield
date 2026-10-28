require("dotenv").config();
const mongoose = require("mongoose");
const Weather = require("./models/Weather");

const weatherAlert = {
  title: "Heavy Rain Alert",
  dateRange: "24 - 26 May 2025",
  description: "High chance of heavy rain in Warangal district.",
};

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    await Weather.deleteMany({});
    await Weather.create(weatherAlert);
    console.log("Weather seeded 🌱");
    mongoose.connection.close();
  })
  .catch((err) => console.log("Error ❌", err));