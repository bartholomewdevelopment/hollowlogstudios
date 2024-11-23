const cloudinary = require('cloudinary').v2;

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // Set in your .env file
  api_key: process.env.CLOUD_API_KEY, // Set in your .env file
  api_secret: process.env.CLOUD_API_SECRET, // Set in your .env file
});

// Export the configured cloudinary instance
module.exports = cloudinary;

// Test Script
(async function testCloudinary() {
  try {
    const result = await cloudinary.uploader.upload('/davinci', {
      folder: 'test-artworks', // Optional folder name
    });
    console.log('Cloudinary Test Upload Successful:', result.secure_url);
  } catch (error) {
    console.error('Cloudinary Test Upload Failed:', error.message);
  }
})();
