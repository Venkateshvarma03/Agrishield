require("dotenv").config();
const mongoose = require("mongoose");
const LoanScheme = require("./models/LoanScheme");

const loans = [
  {
    name: "Kisan Credit Card (sample)",
    provider: "Public sector banks",
    category: "Crop Loan",
    description: "Short-term credit for seeds, fertilizer and other crop expenses.",
    interestRate: 7,
    maxAmount: 300000,
    maxTenureMonths: 12,
  },
  {
    name: "Farm Mechanisation Loan (sample)",
    provider: "Cooperative banks",
    category: "Equipment",
    description: "Finance for tractors, sprayers and other farm machinery.",
    interestRate: 10.5,
    maxAmount: 1000000,
    maxTenureMonths: 60,
  },
  {
    name: "Agri Infrastructure Loan (sample)",
    provider: "Commercial banks",
    category: "Infrastructure",
    description: "Funding for storage, sorting and post-harvest infrastructure.",
    interestRate: 9,
    maxAmount: 2500000,
    maxTenureMonths: 84,
  },
  {
    name: "Cold Storage Loan (sample)",
    provider: "Commercial banks",
    category: "Infrastructure",
    description: "Loans to build or upgrade cold storage and warehouse facilities.",
    interestRate: 9.5,
    maxAmount: 5000000,
    maxTenureMonths: 120,
  },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    await LoanScheme.deleteMany({});
    await LoanScheme.insertMany(loans);
    console.log("Loan schemes seeded 🌱");
    mongoose.connection.close();
  })
  .catch((err) => console.log("Error ❌", err));