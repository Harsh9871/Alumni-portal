// src/controllers/upload.controller.js

const uploadService = require('../services/upload.service');

const uploadFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    // Optionally: you can validate file uploads or check file types here

    // Get upload status and paths
    const uploadStatus = uploadService.getUploadStatus(userId);
    const uploadPaths = uploadService.getUploadPaths(userId);

    res.status(200).json({
      success: true,
      message: 'Files uploaded',
      uploaded: uploadStatus,
      paths: uploadPaths
    });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

module.exports = {
  uploadFiles
};