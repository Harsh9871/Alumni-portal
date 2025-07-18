// app.js
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors')

app.use(cors())
const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');
const  userRoutes = require('./routes/user.routes');
const jobsRoutes = require('./routes/jobs.routes');
const applyRoutes = require('./routes/apply.routes');
// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/user', userRoutes);
app.use('/jobs', jobsRoutes)
app.use('/apply', applyRoutes)

// ✅ Serve /public folder statically
app.use('/public', express.static(path.join(__dirname, './public')));

// Health route
app.get('/', (req, res) => {
  res.send('Hello, Dunia!');
});

module.exports = app;
