const mongoose = require("mongoose");

const transportBookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    transport: { type: mongoose.Schema.Types.ObjectId, ref: "Transport", required: true },
    cropName: { type: String, required: true },
    quantityKg: { type: Number, required: true },
    pickupLocation: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    estimatedCost: { type: Number, required: true },
    status: { type: String, default: "Confirmed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TransportBooking", transportBookingSchema);