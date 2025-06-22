// app.js
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes.js');

// Middleware to parse JSON
app.use(express.json());

// Basic health check route
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello, Dunia!');
});

module.exports = app;
