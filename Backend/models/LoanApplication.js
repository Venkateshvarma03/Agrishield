const mongoose = require("mongoose");

const loanApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    loanScheme: { type: mongoose.Schema.Types.ObjectId, ref: "LoanScheme", required: true },
    amount: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    purpose: { type: String, required: true },
    emi: { type: Number, required: true },
    status: { type: String, default: "Submitted" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoanApplication", loanApplicationSchema);