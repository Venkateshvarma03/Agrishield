require("dotenv").config();
const mongoose = require("mongoose");
const InsurancePlan = require("./models/InsurancePlan");

const plans = [
  {
    name: "Crop Insurance - Kharif (sample)",
    scheme: "PMFBY",
    season: "Kharif",
    coverage: "Food crops and oilseeds. Covers yield loss from drought, flood, pests and disease.",
    premiumRate: 2,
    sumInsuredPerAcre: 40000,
  },
  {
    name: "Crop Insurance - Rabi (sample)",
    scheme: "PMFBY",
    season: "Rabi",
    coverage: "Food crops and oilseeds grown in the rabi season.",
    premiumRate: 1.5,
    sumInsuredPerAcre: 35000,
  },
  {
    name: "Commercial & Horticultural Crops (sample)",
    scheme: "PMFBY",
    season: "Annual",
    coverage: "Cotton, chilli, turmeric and horticultural crops.",
    premiumRate: 5,
    sumInsuredPerAcre: 60000,
  },
  {
    name: "Weather-Based Cover (sample)",
    scheme: "RWBCIS",
    season: "Seasonal",
    coverage: "Payout triggered by rainfall or temperature deviation, without a field survey.",
    premiumRate: 4,
    sumInsuredPerAcre: 30000,
  },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    await InsurancePlan.deleteMany({});
    await InsurancePlan.insertMany(plans);
    console.log("Insurance plans seeded 🌱");
    mongoose.connection.close();
  })
  .catch((err) => console.log("Error ❌", err));