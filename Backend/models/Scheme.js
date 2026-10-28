const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema({
  iconName: String,
  title: String,
  category: String,
  color: String,
  benefit: String,
  description: String,
  eligibility: [String],
  documents: [String],
  officialUrl: String,
});

module.exports = mongoose.model("Scheme", schemeSchema);