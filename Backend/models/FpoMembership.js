const mongoose = require("mongoose");

const fpoMembershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fpo: { type: mongoose.Schema.Types.ObjectId, ref: "FPO", required: true },
  },
  { timestamps: true }
);

// One membership per user per FPO
fpoMembershipSchema.index({ user: 1, fpo: 1 }, { unique: true });

module.exports = mongoose.model("FpoMembership", fpoMembershipSchema);