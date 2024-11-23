const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  availability: {
    type: String,
    enum: ["Print", "Original", "Both"],
    required: true,
  },
  price: { type: Number }, // For single-price artworks
  printPrice: { type: Number }, // For print pricing (if availability is Both)
  originalPrice: { type: Number }, // For original pricing (if availability is Both)
  imageURL: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Artwork", artworkSchema);
