// src/services/upload.service.js
const path = require('path');
const fs = require('fs');

const getUploadStatus = (userId) => {
  const basePath = path.join(__dirname, '../public');

  const pdfPath = path.join(basePath, `${userId}.pdf`);
  const jpgPath = path.join(basePath, `${userId}.jpg`);

  const result = {
    pdf: fs.existsSync(pdfPath),
    image: fs.existsSync(jpgPath)
  };

  return result;
};

const getUploadPaths = (userId) => {
  return {
    pdf: `/public/${userId}.pdf`,
    image: `/public/${userId}.jpg`
  };
};

const deleteUserUploads = (userId) => {
  const basePath = path.join(__dirname, '../public');

  const files = [`${userId}.pdf`, `${userId}.jpg`];
  files.forEach((filename) => {
    const filePath = path.join(basePath, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};

module.exports = {
  getUploadStatus,
  getUploadPaths,
  deleteUserUploads
};