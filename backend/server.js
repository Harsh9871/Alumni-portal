// server.js
const app = require('./app.js');
const dotenv = require('dotenv');
const prisma = require('./config/db.js');

dotenv.config();

const port = process.env.PORT || 5000;

// Test Prisma DB connection before starting the server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL using Prisma');

    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
