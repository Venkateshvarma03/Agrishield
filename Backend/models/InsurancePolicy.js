const mongoose = require("mongoose");

const insurancePolicySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "InsurancePlan", required: true },
    cropName: { type: String, required: true },
    areaAcres: { type: Number, required: true },
    sumInsured: { type: Number, required: true },
    premium: { type: Number, required: true },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InsurancePolicy", insurancePolicySchema);