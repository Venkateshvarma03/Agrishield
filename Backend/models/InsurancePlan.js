const mongoose = require("mongoose");

const insurancePlanSchema = new mongoose.Schema({
  name: String,
  scheme: String,
  season: String,
  coverage: String,
  premiumRate: Number,        // % of sum insured paid by the farmer
  sumInsuredPerAcre: Number,  // in rupees
});

module.exports = mongoose.model("InsurancePlan", insurancePlanSchema);