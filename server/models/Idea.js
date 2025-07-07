// server/models/Idea.js
const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Idea title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    url: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "finished"],
      default: "pending",
    },
    script: String,
    thumbnail: String,
    tags: String,
    type: { type: String, enum: ["long", "short"], required: true },
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
  }
);

// Use mongoose.models to prevent overwriting the model if it already exists (useful with hot-reloading)
module.exports = mongoose.models.Idea || mongoose.model("Idea", ideaSchema);
