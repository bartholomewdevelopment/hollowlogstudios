const express = require('express');
const Artwork = require('../models/Artwork'); // Your Artwork model
const upload = require('../middlewares/upload'); // Multer middleware
const cloudinary = require('../config/cloudinary'); // Cloudinary config

const router = express.Router();

// Wrap Cloudinary upload_stream in a Promise
const cloudinaryUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'artworks' }, // Folder for organization
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// POST: Create a new artwork
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, price, availability } = req.body;

    // Validate required fields
    if (!title || !category || !price || !availability) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Upload image to Cloudinary
    let imageURL = null;
    if (req.file) {
      try {
        const result = await cloudinaryUpload(req.file.buffer);
        imageURL = result.secure_url; // Extract secure URL
        console.log('Cloudinary upload successful:', imageURL);
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error.message);
        return res.status(500).json({ error: 'Image upload failed' });
      }
    }

    // Create and save the artwork
    const newArtwork = new Artwork({
      title,
      description,
      category,
      price,
      availability,
      imageURL,
    });

    const savedArtwork = await newArtwork.save();
    res.status(201).json(savedArtwork);
  } catch (err) {
    console.error('Error in POST /api/artworks:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch all artworks
router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find();
    res.json(artworks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update an artwork
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, price, availability } = req.body;

    // Fetch existing artwork
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    // Upload new image if provided
    if (req.file) {
      // Optionally delete the old image from Cloudinary
      if (artwork.imageURL) {
        const publicId = artwork.imageURL.split('/').pop().split('.')[0];
        try {
          await cloudinary.uploader.destroy(`artworks/${publicId}`);
          console.log('Old image deleted from Cloudinary');
        } catch (error) {
          console.error('Error deleting old image from Cloudinary:', error.message);
        }
      }

      // Upload new image
      try {
        const result = await cloudinaryUpload(req.file.buffer);
        artwork.imageURL = result.secure_url;
        console.log('New image uploaded to Cloudinary:', artwork.imageURL);
      } catch (error) {
        console.error('Error uploading new image to Cloudinary:', error.message);
        return res.status(500).json({ error: 'New image upload failed' });
      }
    }

    // Update other fields
    artwork.title = title || artwork.title;
    artwork.description = description || artwork.description;
    artwork.category = category || artwork.category;
    artwork.price = price || artwork.price;
    artwork.availability = availability || artwork.availability;

    const updatedArtwork = await artwork.save();
    res.json(updatedArtwork);
  } catch (err) {
    console.error('Error in PUT /api/artworks/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove an artwork
router.delete('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    // Delete the image from Cloudinary
    if (artwork.imageURL) {
      const publicId = artwork.imageURL.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`artworks/${publicId}`);
        console.log('Image deleted from Cloudinary');
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error.message);
      }
    }

    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artwork deleted successfully' });
  } catch (err) {
    console.error('Error in DELETE /api/artworks/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
