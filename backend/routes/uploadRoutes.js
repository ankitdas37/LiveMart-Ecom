const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Allow 'file' or 'image' field for backward compatibility
const uploadField = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]);

router.post('/', uploadField, (req, res) => {
  const file = (req.files && req.files.file && req.files.file[0]) || (req.files && req.files.image && req.files.image[0]) || req.file;
  if (!file) {
    return res.status(400).json({ message: 'No file provided' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'ecommerce', resource_type: 'auto' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Upload failed', error });
      }
      res.status(200).json({ url: result.secure_url });
    }
  );

  streamifier.createReadStream(file.buffer).pipe(uploadStream);
});

module.exports = router;
