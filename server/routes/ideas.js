// server/routes/ideas.js
const express = require("express");
const router = express.Router();
const Idea = require("../models/Idea"); // Adjust path if needed

// GET all ideas
router.get("/", async (req, res) => {
  try {
    const ideas = await Idea.find().sort({ createdAt: -1 }); // Sort newest first
    res.json(ideas);
  } catch (err) {
    console.error("Error fetching ideas:", err);
    res
      .status(500)
      .json({ message: "Error fetching ideas", error: err.message });
  }
});

// POST a new idea
router.post("/", async (req, res) => {
  const {
    title,
    description,
    script,
    thumbnail,
    tags,
    category,
    type, // "long" or "short"
  } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const newIdea = new Idea({
    title,
    description,
    script,
    thumbnail,
    tags,
    type,
    category,
    status: "pending",
    createdAt: new Date(),
  });

  try {
    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea); // Return the created idea
  } catch (err) {
    console.error("Error creating idea:", err);
    // Handle potential validation errors from Mongoose
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: err.errors });
    }
    res
      .status(500)
      .json({ message: "Error creating idea", error: err.message });
  }
});

// DELETE an idea
router.delete("/:id", async (req, res) => {
  try {
    const idea = await Idea.findByIdAndDelete(req.params.id);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    res.json({ message: "Idea deleted successfully" });
  } catch (err) {
    console.error("Error deleting idea:", err);
    res
      .status(500)
      .json({ message: "Error deleting idea", error: err.message });
  }
});

// PATCH (Update) an idea to mark as finished
router.patch("/:id/finish", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string" || url.trim() === "") {
    return res
      .status(400)
      .json({ message: "Valid URL is required to finish an idea" });
  }

  try {
    const updatedIdea = await Idea.findByIdAndUpdate(
      req.params.id,
      { status: "finished", url: url.trim() },
      { new: true, runValidators: true } // Return the updated doc, run schema validators
    );

    if (!updatedIdea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    res.json(updatedIdea); // Return the updated idea
  } catch (err) {
    console.error("Error finishing idea:", err);
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: err.errors });
    }
    res
      .status(500)
      .json({ message: "Error finishing idea", error: err.message });
  }
});

module.exports = router;
