require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const path = require("path");
const trackerRoutes = require("./models/tracker");
// const ideaRoutes = require('./routes/ideas'); // <-- Commented temporarily

const app = express();
app.use(cors());
app.use(express.json());

// Optional: MongoDB connection if you still need it
// const MONGODB_URI = process.env.MONGODB_URI;
// if (MONGODB_URI) {
//     mongoose.connect(MONGODB_URI)
//         .then(() => console.log('MongoDB Connected'))
//         .catch(err => console.error('MongoDB connection error', err));
// }

// Routes
app.use("/api/tracker", trackerRoutes); // Your new visitor/location routes
// app.use('/api/ideas', ideaRoutes);   // <-- Commented out for now

app.get("/api", (req, res) => {
  res.send("1YearAnniversary API root is running!");
});

// Serve static HTML from /client
app.use("/", express.static(path.join(__dirname, "..", "client")));

// Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

module.exports = app;
