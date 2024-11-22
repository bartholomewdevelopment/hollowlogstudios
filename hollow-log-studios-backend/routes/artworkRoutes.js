const express = require('express');
const Artwork = require('../models/Artwork'); // Assuming the model is in models/Artwork.js

const router = express.Router();

// Create Artwork
router.post('/', async (req, res) => {
  try {
    const newArtwork = new Artwork(req.body);
    const savedArtwork = await newArtwork.save();
    res.status(201).json(savedArtwork);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch All Artworks
router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find();
    res.json(artworks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update Artwork
router.put('/:id', async (req, res) => {
  try {
    const updatedArtwork = await Artwork.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedArtwork);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Artwork
router.delete('/:id', async (req, res) => {
  try {
    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artwork deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
