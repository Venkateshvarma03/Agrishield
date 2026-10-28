require("dotenv").config();
const mongoose = require("mongoose");
const Transport = require("./models/Transport");

const data = [
  { name: "Ravi Transports", vehicleType: "mini-truck", capacityKg: 2000, district: "Karimnagar", ratePerKm: 15, available: true },
  { name: "Telangana Freight Co.", vehicleType: "truck", capacityKg: 8000, district: "Karimnagar", ratePerKm: 25, available: true },
  { name: "Warangal Logistics", vehicleType: "mini-truck", capacityKg: 1500, district: "Warangal", ratePerKm: 18, available: true },
  { name: "Adilabad Cargo Movers", vehicleType: "truck", capacityKg: 6000, district: "Adilabad", ratePerKm: 22, available: true },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Transport.deleteMany({});
  await Transport.insertMany(data);
  console.log("Transport data seeded ✅");
  process.exit();
});