const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  name: String,
  quantity: String,
  harvestDate: String,
  price: Number,
  change: Number,
  EstRevenue: Number,
  status: String,
});

const Crop = mongoose.model("Crop", cropSchema);

module.exports = Crop;