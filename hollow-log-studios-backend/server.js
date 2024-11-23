const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Moved to the top for consistency

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Apply CORS middleware
app.use(express.json()); // For parsing JSON requests

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Ensures proper connection handling
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Import and Use Routes
const artworkRoutes = require('./routes/artworkRoutes');
app.use('/api/artworks', artworkRoutes); // Mount the artwork routes at '/api/artworks'

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
