const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cropName: { type: String, required: true },
    quantityQuintals: { type: Number, required: true },
    askingPrice: { type: Number, required: true }, // ₹ per quintal
    location: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, default: "Open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);