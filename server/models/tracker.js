require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Optional MongoDB (comment this out if not needed)
// const MONGODB_URI = process.env.MONGODB_URI;
// if (MONGODB_URI) {
//     mongoose.connect(MONGODB_URI)
//         .then(() => console.log('MongoDB Connected'))
//         .catch(err => console.error('MongoDB connection error', err));
// }

// -------------------------
// Inlined Visitor Tracking API
// -------------------------

let visitors = [];
let locations = [];
let permissionDenials = [];

function isUniqueVisitor(ip) {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return !visitors.find(
    (v) => v.ip === ip && new Date(v.timestamp) > thirtyMinutesAgo
  );
}

app.get("/api/tracker/images", (req, res) => {
  const referer = req.headers.referer || "";
  const ip = req.ip;

  if (!referer.includes("/admin") && isUniqueVisitor(ip)) {
    visitors.push({ ip, timestamp: new Date().toISOString() });
  }

  res.json([
    "https://res.cloudinary.com/wows/image/upload/v1750207667/vha50d4lhrunsninmzdi.jpg",
    "https://res.cloudinary.com/wows/image/upload/v1750207667/o1mlrgmyl8fmdeecpug1.jpg",
    "https://res.cloudinary.com/wows/image/upload/v1750207667/rhluroa63powunftqeqf.jpg",
    "https://res.cloudinary.com/wows/image/upload/v1750207667/bzr1jdcvvihleagvb7tk.jpg",
    "https://res.cloudinary.com/wows/image/upload/v1750207667/ikl0orfureiwwkvymhpt.jpg",
    "https://placehold.co/750x550/FFA033/000000?text=Image+6",
    "https://placehold.co/850x650/33FFAB/FFFFFF?text=Image+7",
    "https://placehold.co/650x750/AB33FF/000000?text=Image+8",
    "https://placehold.co/950x750/33A0FF/FFFFFF?text=Image+9",
    "https://placehold.co/700x900/FF3357/000000?text=Image+10",
    "https://placehold.co/800x600/FF5733/FFFFFF?text=Image+11",
    "https://placehold.co/900x700/33FF57/000000?text=Image+12",
    "https://placehold.co/700x500/5733FF/FFFFFF?text=Image+13",
    "https://placehold.co/1000x800/33A0FF/000000?text=Image+14",
    "https://placehold.co/600x900/FF33A0/FFFFFF?text=Image+15",
    "https://placehold.co/750x550/FFA033/000000?text=Image+16",
  ]);
});

app.post("/api/tracker/location", (req, res) => {
  const { latitude, longitude } = req.body;
  locations.push({
    ip: req.ip,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true });
});

app.post("/api/tracker/permission-denial", (req, res) => {
  permissionDenials.push({ ip: req.ip, timestamp: new Date().toISOString() });
  res.json({ success: true });
});

app.get("/api/tracker/visitors", (req, res) => res.json(visitors));
app.get("/api/tracker/locations", (req, res) => res.json(locations));
app.get("/api/tracker/permission-denials", (req, res) =>
  res.json(permissionDenials)
);

// Test API root
app.get("/api", (req, res) => {
  res.send("Tracker API root is running!");
});

// Serve frontend
app.use("/", express.static(path.join(__dirname, "..", "client")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

module.exports = app;
