// src/routes/upload.routes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer.middleware');

// allow both or single file
router.post(
  '/upload',
  verifyToken,
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  uploadController.uploadFiles
);

module.exports = router;
