require("dotenv").config();
const mongoose = require("mongoose");
const Scheme = require("./models/Scheme");

const schemes = [
  {
    iconName: "Landmark",
    title: "PM Kisan Samman Nidhi (PM-KISAN)",
    category: "Income Support",
    color: "green",
    benefit: "₹6,000 per year",
    description: "Direct income support paid in three equal instalments into the bank accounts of farmer families.",
    eligibility: [
      "Landholding farmer family",
      "Bank account linked with Aadhaar",
      "Some categories are excluded, such as income-tax payers and government employees. Check the portal.",
    ],
    documents: ["Aadhaar card", "Land records", "Bank account details"],
    officialUrl: "https://pmkisan.gov.in",
  },
  {
    iconName: "ShieldCheck",
    title: "PM Fasal Bima Yojana (PMFBY)",
    category: "Insurance",
    color: "blue",
    benefit: "Low-premium crop insurance",
    description: "Financial support when notified crops are lost to natural calamities, pests or disease.",
    eligibility: [
      "Farmers growing notified crops in notified areas",
      "Tenant farmers and sharecroppers may also be covered. Check the portal.",
    ],
    documents: ["Aadhaar card", "Land or tenancy records", "Bank passbook", "Sowing declaration"],
    officialUrl: "https://pmfby.gov.in",
  },
  {
    iconName: "Building2",
    title: "Agriculture Infrastructure Fund",
    category: "Infrastructure",
    color: "orange",
    benefit: "3% interest subvention on loans up to ₹2 crore",
    description: "Medium to long-term loans for storage, cold chain and other post-harvest infrastructure, with interest subvention and credit guarantee.",
    eligibility: [
      "Farmers, FPOs, cooperatives and agri-entrepreneurs",
      "The project must be a post-harvest or community farming asset",
    ],
    documents: ["Detailed project report", "Land documents", "Identity and bank details"],
    officialUrl: "https://agriinfra.dac.gov.in",
  },
  {
    iconName: "ShoppingCart",
    title: "e-NAM Marketplace",
    category: "Marketing",
    color: "purple",
    benefit: "Sell to buyers across India online",
    description: "A national online market that links mandis for transparent price discovery.",
    eligibility: [
      "Farmers selling at an e-NAM-linked mandi",
      "Registration at the mandi or on the portal",
    ],
    documents: ["Aadhaar card", "Bank account details", "Mobile number"],
    officialUrl: "https://www.enam.gov.in",
  },
  {
    iconName: "CreditCard",
    title: "Kisan Credit Card (KCC)",
    category: "Credit",
    color: "yellow",
    benefit: "Flexible farm credit through banks",
    description: "Single-window credit for cultivation and post-harvest needs, with interest subvention on prompt repayment.",
    eligibility: [
      "Farmers, tenant farmers and sharecroppers",
      "Farmers in dairy and fisheries may also be covered",
    ],
    documents: ["Application form from your bank", "Identity and address proof", "Land records"],
    officialUrl: "https://www.pmkisan.gov.in/kcc.aspx",
  },
  {
    iconName: "Sprout",
    title: "Soil Health Card",
    category: "Soil Health",
    color: "teal",
    benefit: "Free soil testing and advice",
    description: "A card showing your soil's nutrient status, with recommendations for fertiliser use.",
    eligibility: ["All farmers"],
    documents: ["A soil sample from your field", "Aadhaar or farmer ID", "Land details"],
    officialUrl: "https://soilhealth.dac.gov.in",
  },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    await Scheme.deleteMany({});
    await Scheme.insertMany(schemes);
    console.log("Schemes seeded 🌱");
    mongoose.connection.close();
  })
  .catch((err) => console.log("Error ❌", err));