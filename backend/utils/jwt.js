// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'default_secret';

exports.generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};
