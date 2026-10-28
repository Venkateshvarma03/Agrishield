const mongoose = require("mongoose");

const loanSchemeSchema = new mongoose.Schema({
  name: String,
  provider: String,
  category: String,
  description: String,
  interestRate: Number,   // % per year
  maxAmount: Number,      // in rupees
  maxTenureMonths: Number,
});

module.exports = mongoose.model("LoanScheme", loanSchemeSchema);