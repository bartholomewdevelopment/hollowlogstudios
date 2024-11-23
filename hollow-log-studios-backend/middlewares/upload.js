const multer = require('multer');

// Configure multer to use memory storage
const storage = multer.memoryStorage(); // Store files in memory as a buffer

const upload = multer({ storage });

module.exports = upload;
