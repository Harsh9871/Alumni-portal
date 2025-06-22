// app.js
const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.send('Hello, Dunia!');
});

module.exports = app;
