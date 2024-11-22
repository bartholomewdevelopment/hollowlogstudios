const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: String, enum: ['Print', 'Original', 'Both'], required: true },
  imageURL: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Artwork', artworkSchema);
