require("dotenv").config();
const mongoose = require("mongoose");
const FPO = require("./models/FPO");

const fpos = [
  {
    name: "Warangal Farmers Producer Company (sample)",
    district: "Warangal",
    crops: ["Paddy", "Maize", "Chilli"],
    services: ["Bulk selling", "Input supply", "Storage access"],
    description: "Pools produce from small farmers to sell in bulk at better prices.",
  },
  {
    name: "Karimnagar Agri Growers Group (sample)",
    district: "Karimnagar",
    crops: ["Paddy", "Cotton"],
    services: ["Training", "Equipment sharing", "Credit linkage"],
    description: "Shared machinery and training for paddy and cotton growers.",
  },
  {
    name: "Nizamabad Turmeric Producers (sample)",
    district: "Nizamabad",
    crops: ["Turmeric", "Red gram"],
    services: ["Processing", "Bulk selling", "Quality testing"],
    description: "Helps turmeric farmers with processing and direct buyer contacts.",
  },
  {
    name: "Adilabad Cotton Farmers Collective (sample)",
    district: "Adilabad",
    crops: ["Cotton", "Soybean"],
    services: ["Bulk selling", "Insurance help", "Transport pooling"],
    description: "Pooled transport and group insurance for cotton farmers.",
  },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    await FPO.deleteMany({});
    await FPO.insertMany(fpos);
    console.log("FPOs seeded 🌱");
    mongoose.connection.close();
  })
  .catch((err) => console.log("Error ❌", err));