const mongoose = require("mongoose");

const storageSchema = new mongoose.Schema({
  name: String,
  distance: String,
  capacity: String,
  type: String,
  available: { type: Boolean, default: true },
  lat: Number,
  lng: Number,
});

module.exports = mongoose.model("Storage", storageSchema);