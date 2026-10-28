const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema({
  name: String,
  vehicleType: String,
  capacityKg: Number,
  district: String,
  ratePerKm: Number,
  available: { type: Boolean, default: true },
});

module.exports = mongoose.model("Transport", transportSchema);