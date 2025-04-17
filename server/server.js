// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ideaRoutes = require('./routes/ideas');

const app = express();
// PORT is not needed when deploying to Vercel, but keep for local dev
// const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// --- Database Connection ---
// (Keep your existing connection logic)
if (!MONGODB_URI) {
    console.error("FATAL ERROR: MONGODB_URI is not defined.");
    // Don't exit process in serverless context, let Vercel handle errors
} else {
    mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        // Log error, Vercel will show function failure
    });
}


// --- Middleware ---
app.use(cors()); // Consider configuring origins more strictly for production
app.use(express.json());

// --- Routes ---
// Make sure API routes are prefixed correctly if needed,
// but the vercel.json handles the /api prefixing
app.use('/api/ideas', ideaRoutes); // This is correct because vercel.json routes /api/* here

// Add a root route for the API endpoint itself for testing
app.get('/api', (req, res) => {
    res.send('Idea Tracker API root is running!');
});


// --- Vercel Export ---
// Remove or comment out app.listen()
/*
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
*/

// Export the Express app instance for Vercel
module.exports = app;