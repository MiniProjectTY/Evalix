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
      const fileExt = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
    },
  });
  const upload = multer({ storage: storage });

// Define routes
router.post('/evaluate',upload.single('file'), controller.handler);

module.exports = router;
