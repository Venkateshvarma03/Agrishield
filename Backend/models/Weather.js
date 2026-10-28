const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
  title: String,
  dateRange: String,
  description: String,
});

module.exports = mongoose.model("Weather", weatherSchema);