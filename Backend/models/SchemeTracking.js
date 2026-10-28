const mongoose = require("mongoose");

const schemeTrackingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheme: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme", required: true },
    status: {
      type: String,
      enum: ["Interested", "Applied", "Approved", "Rejected"],
      default: "Interested",
    },
  },
  { timestamps: true }
);

// One tracking record per user per scheme
schemeTrackingSchema.index({ user: 1, scheme: 1 }, { unique: true });

module.exports = mongoose.model("SchemeTracking", schemeTrackingSchema);