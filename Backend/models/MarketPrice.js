const mongoose = require("mongoose");

const marketPriceSchema = new mongoose.Schema({
  commodity: String,
  market: String,
  price: Number,
  trend: Number,
});

const MarketPrice = mongoose.model("MarketPrice", marketPriceSchema);

module.exports = MarketPrice;