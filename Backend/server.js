require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Crop = require("./models/Crop");
const MarketPrice = require("./models/MarketPrice");
const Weather = require("./models/Weather");
const Scheme = require("./models/Scheme");
const User = require("./models/User");
const authMiddleware = require("./middleware/auth");
const axios = require("axios");
const Storage = require("./models/Storage");
const Transport = require("./models/Transport");
const Booking = require("./models/Booking");
const multer = require("multer");
const FormData = require("form-data");
const TransportBooking = require("./models/TransportBooking");
const LoanScheme = require("./models/LoanScheme");
const LoanApplication = require("./models/LoanApplication");
const InsurancePlan = require("./models/InsurancePlan");
const InsurancePolicy = require("./models/InsurancePolicy");
const Listing = require("./models/Listing");
const Offer = require("./models/Offer");
const FPO = require("./models/FPO");
const FpoMembership = require("./models/FpoMembership");
const SchemeTracking = require("./models/SchemeTracking");

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB connection error ❌", err));

app.get("/", (req, res) => {
  res.send("AgriShield Network backend is running 🌱");
});

// ---------- Authentication ----------
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User created successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ message: "Login successful ✅", token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- Crops ----------
app.get("/api/crops", async (req, res) => {
  const crops = await Crop.find();
  res.json(crops);
});

app.post("/api/crops", authMiddleware, async (req, res) => {
  const newCrop = new Crop(req.body);
  await newCrop.save();
  res.json(newCrop);
});

app.put("/api/crops/:id", authMiddleware, async (req, res) => {
  const updatedCrop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedCrop);
});

app.delete("/api/crops/:id", authMiddleware, async (req, res) => {
  await Crop.findByIdAndDelete(req.params.id);
  res.json({ message: "Crop deleted" });
});

// ---------- Market Prices ----------
app.get("/api/market-prices", async (req, res) => {
  const marketPrices = await MarketPrice.find();
  res.json(marketPrices);
});

app.get("/api/live-market-prices", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24`,
      {
        params: {
          "api-key": process.env.DATA_GOV_API_KEY,
          format: "json",
          limit: 20,
          "filters[State]": "Telangana",
          sort: "-Arrival_Date",
        },
        timeout: 8000,
      }
    );
    res.json(response.data.records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch live market prices", error: err.message });
  }
});

app.post("/api/market-prices", authMiddleware, async (req, res) => {
  const newPrice = new MarketPrice(req.body);
  await newPrice.save();
  res.json(newPrice);
});

app.put("/api/market-prices/:id", authMiddleware, async (req, res) => {
  const updated = await MarketPrice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete("/api/market-prices/:id", authMiddleware, async (req, res) => {
  await MarketPrice.findByIdAndDelete(req.params.id);
  res.json({ message: "Market price deleted" });
});

// ---------- Weather ----------
app.get("/api/weather", async (req, res) => {
  const weather = await Weather.findOne();
  res.json(weather);
});

// ---------- Government Schemes ----------
app.get("/api/govt-schemes", async (req, res) => {
  const schemes = await Scheme.find();
  res.json(schemes);
});

app.post("/api/govt-schemes", authMiddleware, async (req, res) => {
  const newScheme = new Scheme(req.body);
  await newScheme.save();
  res.json(newScheme);
});

app.put("/api/govt-schemes/:id", authMiddleware, async (req, res) => {
  const updated = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete("/api/govt-schemes/:id", authMiddleware, async (req, res) => {
  await Scheme.findByIdAndDelete(req.params.id);
  res.json({ message: "Scheme deleted" });
});

// ---------- Storage ----------
app.get("/api/storage", async (req, res) => {
  const storages = await Storage.find();
  res.json(storages);
});

// Books a storage only if it is still available (check + update in one step)
app.post("/api/storage/:id/book", authMiddleware, async (req, res) => {
  try {
    const updated = await Storage.findOneAndUpdate(
      { _id: req.params.id, available: true },
      { available: false },
      { new: true }
    );
    if (!updated) {
      return res.status(400).json({ message: "Storage already booked" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
});

// ---------- Bookings ----------
// Create a booking
app.post("/api/bookings", authMiddleware, async (req, res) => {
  const { storageId, cropName, quantity, startDate, endDate } = req.body;
  try {
    if (!storageId || !cropName || !quantity || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const storage = await Storage.findById(storageId);
    if (!storage) return res.status(404).json({ message: "Storage not found" });

    if (Number(quantity) > parseFloat(storage.capacity)) {
      return res.status(400).json({ message: `Quantity exceeds capacity (${storage.capacity})` });
    }

    // Lock the storage only if it is still available
    const locked = await Storage.findOneAndUpdate(
      { _id: storageId, available: true },
      { available: false },
      { new: true }
    );
    if (!locked) return res.status(400).json({ message: "Storage already booked" });

    try {
      const booking = await Booking.create({
        user: req.user.id,
        storage: storageId,
        cropName,
        quantity: Number(quantity),
        startDate,
        endDate,
      });
      res.json({ booking, storage: locked });
    } catch (err) {
      // If saving the booking fails, release the storage again
      await Storage.findByIdAndUpdate(storageId, { available: true });
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
});

// Bookings of the logged-in user
app.get("/api/bookings", authMiddleware, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate("storage")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// Cancel a booking (owner only)
app.delete("/api/bookings/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await Storage.findByIdAndUpdate(booking.storage, { available: true });
    await booking.deleteOne();
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed", error: err.message });
  }
});

// ---------- Transport ----------
app.get("/api/transport", async (req, res) => {
  try {
    const { district } = req.query;
    const filter = district ? { district: new RegExp(district, "i") } : {};
    const transports = await Transport.find(filter);
    res.json(transports);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transport data", error: err.message });
  }
});


app.post("/api/transport/:id/book", authMiddleware, async (req, res) => {
  const { cropName, quantityKg, pickupLocation, distanceKm } = req.body;
  try {
    if (!cropName || !quantityKg || !pickupLocation || !distanceKm) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transport = await Transport.findById(req.params.id);
    if (!transport) return res.status(404).json({ message: "Transport not found" });

    if (!transport.available) {
      return res.status(400).json({ message: "This vehicle is no longer available" });
    }

    if (Number(quantityKg) > transport.capacityKg) {
      return res.status(400).json({ message: `Quantity exceeds vehicle capacity (${transport.capacityKg} kg)` });
    }

    const estimatedCost = Number(distanceKm) * transport.ratePerKm;

    const locked = await Transport.findOneAndUpdate(
      { _id: req.params.id, available: true },
      { available: false },
      { new: true }
    );
    if (!locked) return res.status(400).json({ message: "This vehicle is no longer available" });

    try {
      const booking = await TransportBooking.create({
        user: req.user.id,
        transport: req.params.id,
        cropName,
        quantityKg: Number(quantityKg),
        pickupLocation,
        distanceKm: Number(distanceKm),
        estimatedCost,
      });
      res.json({ booking, transport: locked });
    } catch (err) {
      await Transport.findByIdAndUpdate(req.params.id, { available: true });
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
});

app.get("/api/transport-bookings", authMiddleware, async (req, res) => {
  const bookings = await TransportBooking.find({ user: req.user.id })
    .populate("transport")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

app.delete("/api/transport-bookings/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await TransportBooking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await Transport.findByIdAndUpdate(booking.transport, { available: true });
    await booking.deleteOne();
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed", error: err.message });
  }
});
// ---------- AI Agent Recommendation ----------
app.post("/api/agent/recommend", async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.AGENT_SERVICE_URL}/api/agent/recommend`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Agent service unavailable", details: err.message });
  }
});

// ---------- Finance & Loans ----------
app.get("/api/loan-schemes", async (req, res) => {
  const schemes = await LoanScheme.find();
  res.json(schemes);
});

app.post("/api/loan-applications", authMiddleware, async (req, res) => {
  const { schemeId, amount, tenureMonths, purpose } = req.body;
  try {
    if (!schemeId || !amount || !tenureMonths || !purpose) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const scheme = await LoanScheme.findById(schemeId);
    if (!scheme) return res.status(404).json({ message: "Loan scheme not found" });

    const principal = Number(amount);
    const months = Number(tenureMonths);

    if (principal <= 0 || months <= 0) {
      return res.status(400).json({ message: "Amount and tenure must be positive" });
    }
    if (principal > scheme.maxAmount) {
      return res.status(400).json({ message: `Amount exceeds the limit of ₹${scheme.maxAmount.toLocaleString("en-IN")}` });
    }
    if (months > scheme.maxTenureMonths) {
      return res.status(400).json({ message: `Tenure exceeds the maximum of ${scheme.maxTenureMonths} months` });
    }

    // EMI = P * r * (1+r)^n / ((1+r)^n - 1), r = monthly rate
    const r = scheme.interestRate / 12 / 100;
    const emi =
      r === 0
        ? principal / months
        : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);

    const application = await LoanApplication.create({
      user: req.user.id,
      loanScheme: schemeId,
      amount: principal,
      tenureMonths: months,
      purpose,
      emi: Math.round(emi),
    });

    res.json({ application });
  } catch (err) {
    res.status(500).json({ message: "Application failed", error: err.message });
  }
});

app.get("/api/loan-applications", authMiddleware, async (req, res) => {
  const applications = await LoanApplication.find({ user: req.user.id })
    .populate("loanScheme")
    .sort({ createdAt: -1 });
  res.json(applications);
});

app.delete("/api/loan-applications/:id", authMiddleware, async (req, res) => {
  try {
    const application = await LoanApplication.findOne({ _id: req.params.id, user: req.user.id });
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "Submitted") {
      return res.status(400).json({ message: "Only submitted applications can be withdrawn" });
    }
    await application.deleteOne();
    res.json({ message: "Application withdrawn" });
  } catch (err) {
    res.status(500).json({ message: "Withdraw failed", error: err.message });
  }
});

// ---------- Voice Assistant ----------
app.post("/api/voice/query", upload.single("audio"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("audio", req.file.buffer, {
      filename: "recording.webm",
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      `${process.env.AGENT_SERVICE_URL}/api/voice/query`,
      formData,
      { headers: formData.getHeaders() }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Voice service unavailable", details: err.message });
  }
});

// ---------- Insurance ----------
app.get("/api/insurance-plans", async (req, res) => {
  const plans = await InsurancePlan.find();
  res.json(plans);
});

app.post("/api/insurance-policies", authMiddleware, async (req, res) => {
  const { planId, cropName, areaAcres } = req.body;
  try {
    if (!planId || !cropName || !areaAcres) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const plan = await InsurancePlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Insurance plan not found" });

    const area = Number(areaAcres);
    if (!(area > 0) || area > 50) {
      return res.status(400).json({ message: "Area must be between 0 and 50 acres" });
    }

    // Sum insured and premium are calculated on the server
    const sumInsured = area * plan.sumInsuredPerAcre;
    const premium = Math.round((sumInsured * plan.premiumRate) / 100);

    const policy = await InsurancePolicy.create({
      user: req.user.id,
      plan: planId,
      cropName,
      areaAcres: area,
      sumInsured,
      premium,
    });

    res.json({ policy });
  } catch (err) {
    res.status(500).json({ message: "Enrollment failed", error: err.message });
  }
});

app.get("/api/insurance-policies", authMiddleware, async (req, res) => {
  const policies = await InsurancePolicy.find({ user: req.user.id })
    .populate("plan")
    .sort({ createdAt: -1 });
  res.json(policies);
});

app.delete("/api/insurance-policies/:id", authMiddleware, async (req, res) => {
  try {
    const policy = await InsurancePolicy.findOne({ _id: req.params.id, user: req.user.id });
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    await policy.deleteOne();
    res.json({ message: "Policy cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed", error: err.message });
  }
});

// ---------- Marketplace ----------
// Open listings from everyone
app.get("/api/listings", authMiddleware, async (req, res) => {
  const listings = await Listing.find({ status: "Open" })
    .populate("seller", "name")
    .sort({ createdAt: -1 });

  res.json(
    listings.map((l) => ({
      _id: l._id,
      cropName: l.cropName,
      quantityQuintals: l.quantityQuintals,
      askingPrice: l.askingPrice,
      location: l.location,
      description: l.description,
      status: l.status,
      sellerName: l.seller?.name ?? "Unknown",
      isMine: String(l.seller?._id) === req.user.id,
      createdAt: l.createdAt,
    }))
  );
});

// Create a listing
app.post("/api/listings", authMiddleware, async (req, res) => {
  const { cropName, quantityQuintals, askingPrice, location, description } = req.body;
  try {
    if (!cropName || !quantityQuintals || !askingPrice || !location) {
      return res.status(400).json({ message: "Crop, quantity, price and location are required" });
    }
    if (!(Number(quantityQuintals) > 0) || !(Number(askingPrice) > 0)) {
      return res.status(400).json({ message: "Quantity and price must be positive" });
    }

    const listing = await Listing.create({
      seller: req.user.id,
      cropName,
      quantityQuintals: Number(quantityQuintals),
      askingPrice: Number(askingPrice),
      location,
      description,
    });
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ message: "Could not create listing", error: err.message });
  }
});

// My listings, with the offers received on each
app.get("/api/my-listings", authMiddleware, async (req, res) => {
  const listings = await Listing.find({ seller: req.user.id }).sort({ createdAt: -1 });
  const result = await Promise.all(
    listings.map(async (l) => {
      const offers = await Offer.find({ listing: l._id })
        .populate("buyer", "name")
        .sort({ createdAt: -1 });
      return { ...l.toObject(), offers };
    })
  );
  res.json(result);
});

// Remove my listing (and its offers)
app.delete("/api/listings/:id", authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, seller: req.user.id });
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    await Offer.deleteMany({ listing: listing._id });
    await listing.deleteOne();
    res.json({ message: "Listing removed" });
  } catch (err) {
    res.status(500).json({ message: "Could not remove listing", error: err.message });
  }
});

// Make an offer on someone else's listing
app.post("/api/listings/:id/offers", authMiddleware, async (req, res) => {
  const { pricePerQuintal, quantityQuintals, message } = req.body;
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.status !== "Open") {
      return res.status(400).json({ message: "This listing is no longer open" });
    }
    if (String(listing.seller) === req.user.id) {
      return res.status(400).json({ message: "You cannot make an offer on your own listing" });
    }

    const price = Number(pricePerQuintal);
    const qty = Number(quantityQuintals);
    if (!(price > 0) || !(qty > 0)) {
      return res.status(400).json({ message: "Price and quantity must be positive" });
    }
    if (qty > listing.quantityQuintals) {
      return res.status(400).json({ message: `Quantity exceeds what is listed (${listing.quantityQuintals} quintals)` });
    }

    const existing = await Offer.findOne({ listing: listing._id, buyer: req.user.id, status: "Pending" });
    if (existing) {
      return res.status(400).json({ message: "You already have a pending offer on this listing" });
    }

    const offer = await Offer.create({
      listing: listing._id,
      buyer: req.user.id,
      pricePerQuintal: price,
      quantityQuintals: qty,
      message,
    });
    res.json({ offer });
  } catch (err) {
    res.status(500).json({ message: "Could not send offer", error: err.message });
  }
});

// Offers I have made
app.get("/api/my-offers", authMiddleware, async (req, res) => {
  const offers = await Offer.find({ buyer: req.user.id })
    .populate("listing", "cropName quantityQuintals askingPrice location status")
    .sort({ createdAt: -1 });
  res.json(offers);
});

// Withdraw my pending offer
app.delete("/api/offers/:id", authMiddleware, async (req, res) => {
  try {
    const offer = await Offer.findOne({ _id: req.params.id, buyer: req.user.id });
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    if (offer.status !== "Pending") {
      return res.status(400).json({ message: "Only pending offers can be withdrawn" });
    }
    await offer.deleteOne();
    res.json({ message: "Offer withdrawn" });
  } catch (err) {
    res.status(500).json({ message: "Could not withdraw offer", error: err.message });
  }
});

// Seller accepts or rejects an offer
app.patch("/api/offers/:id/respond", authMiddleware, async (req, res) => {
  const { decision } = req.body;
  try {
    if (!["accept", "reject"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be accept or reject" });
    }

    const offer = await Offer.findById(req.params.id).populate("listing");
    if (!offer || !offer.listing) return res.status(404).json({ message: "Offer not found" });
    if (String(offer.listing.seller) !== req.user.id) {
      return res.status(403).json({ message: "Only the seller can respond to this offer" });
    }
    if (offer.status !== "Pending") {
      return res.status(400).json({ message: "This offer has already been answered" });
    }

    if (decision === "accept") {
      if (offer.listing.status !== "Open") {
        return res.status(400).json({ message: "This listing is no longer open" });
      }
      offer.status = "Accepted";
      await offer.save();

      offer.listing.status = "Sold";
      await offer.listing.save();

      await Offer.updateMany(
        { listing: offer.listing._id, _id: { $ne: offer._id }, status: "Pending" },
        { status: "Rejected" }
      );
    } else {
      offer.status = "Rejected";
      await offer.save();
    }

    res.json({ offer });
  } catch (err) {
    res.status(500).json({ message: "Could not update offer", error: err.message });
  }
});


// ---------- FPO / Groups ----------
app.get("/api/fpos", authMiddleware, async (req, res) => {
  const fpos = await FPO.find().sort({ name: 1 });
  const memberships = await FpoMembership.find();

  res.json(
    fpos.map((f) => {
      const members = memberships.filter((m) => String(m.fpo) === String(f._id));
      return {
        ...f.toObject(),
        memberCount: members.length,
        joined: members.some((m) => String(m.user) === req.user.id),
      };
    })
  );
});

app.post("/api/fpos/:id/join", authMiddleware, async (req, res) => {
  try {
    const fpo = await FPO.findById(req.params.id);
    if (!fpo) return res.status(404).json({ message: "FPO not found" });

    await FpoMembership.create({ user: req.user.id, fpo: fpo._id });
    res.json({ message: "Joined successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You are already a member of this FPO" });
    }
    res.status(500).json({ message: "Could not join", error: err.message });
  }
});

app.delete("/api/fpos/:id/leave", authMiddleware, async (req, res) => {
  try {
    const removed = await FpoMembership.findOneAndDelete({ user: req.user.id, fpo: req.params.id });
    if (!removed) return res.status(404).json({ message: "You are not a member of this FPO" });
    res.json({ message: "Left successfully" });
  } catch (err) {
    res.status(500).json({ message: "Could not leave", error: err.message });
  }
});
// ---------- Reports & Analytics ----------
app.get("/api/reports/summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [crops, storageBookings, transportBookings, loans, policies, myListings, offersMade, memberships] =
      await Promise.all([
        Crop.find(),
        Booking.find({ user: userId }),
        TransportBooking.find({ user: userId }),
        LoanApplication.find({ user: userId }),
        InsurancePolicy.find({ user: userId }),
        Listing.find({ seller: userId }),
        Offer.find({ buyer: userId }),
        FpoMembership.find({ user: userId }),
      ]);

    const offersReceived = await Offer.find({
      listing: { $in: myListings.map((l) => l._id) },
    });

    const sum = (arr, key) => arr.reduce((total, item) => total + (item[key] || 0), 0);

    const cropsByStatus = {};
    crops.forEach((c) => {
      cropsByStatus[c.status] = (cropsByStatus[c.status] || 0) + 1;
    });

    res.json({
      crops: {
        count: crops.length,
        totalRevenue: sum(crops, "EstRevenue"),
        byStatus: cropsByStatus,
        list: crops.map((c) => ({ name: c.name, revenue: c.EstRevenue })),
      },
      storage: {
        bookings: storageBookings.length,
        quintalsBooked: sum(storageBookings, "quantity"),
      },
      transport: {
        bookings: transportBookings.length,
        totalCost: sum(transportBookings, "estimatedCost"),
      },
      loans: {
        applications: loans.length,
        totalAmount: sum(loans, "amount"),
        monthlyEmi: sum(loans, "emi"),
      },
      insurance: {
        policies: policies.length,
        totalSumInsured: sum(policies, "sumInsured"),
        totalPremium: sum(policies, "premium"),
      },
      marketplace: {
        listings: myListings.length,
        soldListings: myListings.filter((l) => l.status === "Sold").length,
        offersMade: offersMade.length,
        offersAccepted: offersMade.filter((o) => o.status === "Accepted").length,
        offersReceived: offersReceived.length,
        pendingOffersReceived: offersReceived.filter((o) => o.status === "Pending").length,
      },
      fpo: { groupsJoined: memberships.length },
    });
  } catch (err) {
    res.status(500).json({ message: "Could not build report", error: err.message });
  }
});
// ---------- Settings / Profile ----------
app.get("/api/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("name email");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

app.put("/api/me", authMiddleware, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({ message: "Name must be between 2 and 60 characters" });
    }
    const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true }).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Could not update profile", error: err.message });
  }
});

app.put("/api/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (typeof currentPassword !== "string" || typeof newPassword !== "string" || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from the current one" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Could not change password", error: err.message });
  }
});

// ---------- Dashboard summary ----------
// Reads "20 Quintals", "10.6" or "500 kg" and returns quintals
const toQuintals = (text) => {
  const n = parseFloat(String(text ?? ""));
  if (!Number.isFinite(n)) return 0;
  return /kg/i.test(String(text)) ? n / 100 : n;
};

app.get("/api/dashboard/summary", authMiddleware, async (req, res) => {
  try {
    const [crops, bookings] = await Promise.all([
      Crop.find({ status: { $ne: "Sold" } }),
      Booking.find({ user: req.user.id }),
    ]);

    res.json({
      activeCrops: crops.length,
      totalQuintals: Math.round(crops.reduce((s, c) => s + toQuintals(c.quantity), 0) * 10) / 10,
      estRevenue: crops.reduce((s, c) => s + (c.EstRevenue || 0), 0),
      storageBookedQuintals: bookings.reduce((s, b) => s + (b.quantity || 0), 0),
      storageBookings: bookings.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load summary", error: err.message });
  }
});
// ---------- Scheme tracking ----------
const TRACKING_STATUSES = ["Interested", "Applied", "Approved", "Rejected"];

app.get("/api/my-schemes", authMiddleware, async (req, res) => {
  const items = await SchemeTracking.find({ user: req.user.id })
    .populate("scheme")
    .sort({ createdAt: -1 });
  res.json(items);
});

app.post("/api/my-schemes", authMiddleware, async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.body.schemeId);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });

    const tracking = await SchemeTracking.create({ user: req.user.id, scheme: scheme._id });
    res.json({ tracking });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You are already tracking this scheme" });
    }
    res.status(500).json({ message: "Could not track scheme", error: err.message });
  }
});

app.patch("/api/my-schemes/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!TRACKING_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const tracking = await SchemeTracking.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true }
    ).populate("scheme");
    if (!tracking) return res.status(404).json({ message: "Tracking record not found" });
    res.json(tracking);
  } catch (err) {
    res.status(500).json({ message: "Could not update status", error: err.message });
  }
});

app.delete("/api/my-schemes/:id", authMiddleware, async (req, res) => {
  try {
    const tracking = await SchemeTracking.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!tracking) return res.status(404).json({ message: "Tracking record not found" });
    res.json({ message: "Removed" });
  } catch (err) {
    res.status(500).json({ message: "Could not remove", error: err.message });
  }
});
// ---------- Start Server ----------
// ---------- Live Weather (Open-Meteo) ----------
const WEATHER_CODES = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Moderate rain", 65: "Heavy rain",
  80: "Light showers", 81: "Showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with hail",
};
const describeWeather = (code) => WEATHER_CODES[code] || "Mixed conditions";

const weatherCache = new Map();
const WEATHER_TTL_MS = 30 * 60 * 1000; // refresh at most every 30 minutes per location

function buildAlerts(forecast) {
  const alerts = [];
  forecast.forEach((d) => {
    const rain = d.rainMm ?? 0;
    const chance = d.rainChance ?? 0;

    if (rain >= 115.6) {
      alerts.push({
        level: "Severe", date: d.date, title: "Very Heavy Rain Alert",
        message: `About ${Math.round(rain)} mm of rain is forecast. Protect harvested and stored crops.`,
      });
    } else if (rain >= 64.5) {
      alerts.push({
        level: "Warning", date: d.date, title: "Heavy Rain Alert",
        message: `About ${Math.round(rain)} mm of rain is forecast. Move harvested crops to covered storage.`,
      });
    } else if (rain >= 15.6 && chance >= 60) {
      alerts.push({
        level: "Watch", date: d.date, title: "Rain Expected",
        message: `Moderate rain likely (${chance}% chance, about ${Math.round(rain)} mm). Plan harvesting and drying around it.`,
      });
    }

    if (d.tempMax !== null && d.tempMax >= 40) {
      alerts.push({
        level: "Warning", date: d.date, title: "High Temperature Alert",
        message: `Maximum temperature of ${Math.round(d.tempMax)}°C expected. Irrigate in the evening and avoid midday field work.`,
      });
    }

    if (d.gustKmh !== null && d.gustKmh >= 50) {
      alerts.push({
        level: "Watch", date: d.date, title: "Strong Wind Alert",
        message: `Wind gusts up to ${Math.round(d.gustKmh)} km/h expected. Secure covers and avoid spraying.`,
      });
    }
  });
  return alerts;
}

app.get("/api/weather/live", async (req, res) => {
  const lat = Number(req.query.lat ?? 17.9689);
  const lon = Number(req.query.lon ?? 79.5941);
  const place = String(req.query.place || "Warangal").slice(0, 60);

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ message: "Invalid coordinates" });
  }

  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.time < WEATHER_TTL_MS) {
    return res.json({ ...cached.data, location: place });
  }

  try {
    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: lat,
        longitude: lon,
        current: "temperature_2m,weather_code",
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_gusts_10m_max",
        timezone: "Asia/Kolkata",
        forecast_days: 5,
      },
      timeout: 8000,
    });

    const { current, daily } = response.data;

    const forecast = daily.time.map((date, i) => ({
      date,
      condition: describeWeather(daily.weather_code[i]),
      tempMax: daily.temperature_2m_max[i] ?? null,
      tempMin: daily.temperature_2m_min[i] ?? null,
      rainMm: daily.precipitation_sum[i] ?? null,
      rainChance: daily.precipitation_probability_max[i] ?? null,
      gustKmh: daily.wind_gusts_10m_max[i] ?? null,
    }));

    const data = {
      location: place,
      source: "Open-Meteo",
      updatedAt: new Date().toISOString(),
      current: {
        temperature: current.temperature_2m,
        condition: describeWeather(current.weather_code),
      },
      forecast,
      alerts: buildAlerts(forecast),
    };

    if (weatherCache.size > 200) weatherCache.clear();
    weatherCache.set(key, { time: Date.now(), data });
    res.json(data);
  } catch (err) {
    // If Open-Meteo is unreachable, serve the last known forecast instead of failing
    if (cached) return res.json({ ...cached.data, location: place, stale: true });
    res.status(502).json({ message: "Could not fetch weather data", error: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});