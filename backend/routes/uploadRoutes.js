const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 uploads per IP per 15 mins
  message: { message: 'Too many uploads from this IP, please try again later.' },
});

// ── File type allowlist ──────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];
const MAX_FILE_SIZE_MB = 10;

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: JPG, PNG, GIF, WEBP, PDF`), false);
  }
};

// Memory storage — files stream directly to Cloudinary, never touch disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter,
});

// Allow 'file' or 'image' field for backward compatibility
const uploadField = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

// Public route, protected by rate limiting
router.post('/', uploadLimiter, uploadField, (req, res) => {
  console.log('UPLOAD REQUEST HEADERS:', req.headers['content-type']);
  console.log('UPLOAD REQUEST FILES:', req.files);
  console.log('UPLOAD REQUEST FILE:', req.file);

  const file =
    (req.files && req.files.file && req.files.file[0]) ||
    (req.files && req.files.image && req.files.image[0]) ||
    req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file provided' });
  }

  // Double-check MIME type server-side (defense in depth)
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return res.status(400).json({ message: 'File type not allowed' });
  }

  // Determine Cloudinary resource type based on MIME
  const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'ecommerce',
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error.message);
        return res.status(500).json({ message: 'Upload failed. Please try again.' });
      }
      res.status(200).json({ url: result.secure_url });
    }
  );

  streamifier.createReadStream(file.buffer).pipe(uploadStream);
});

// Multer error handler — catches file too large and type errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` });
  }
  if (err) {
    return res.status(400).json({ message: err.message || 'Upload error' });
  }
  next();
});

module.exports = router;
