const mongoose = require("mongoose");

const fpoSchema = new mongoose.Schema({
  name: String,
  district: String,
  crops: [String],
  services: [String],
  description: String,
});

module.exports = mongoose.model("FPO", fpoSchema);