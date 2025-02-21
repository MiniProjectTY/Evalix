const express = require('express');
const router = express.Router();
const controller = require('../controller/controller'); // Import controller

const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Set the destination folder where uploaded files will be stored
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      // Set the filename for the uploaded file
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: storage });

// Define routes
router.post('/evaluate',upload.single('file'), controller.handler);

module.exports = router;
