const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pricePerQuintal: { type: Number, required: true },
    quantityQuintals: { type: Number, required: true },
    message: { type: String, default: "" },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);