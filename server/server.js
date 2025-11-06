const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// Health route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB connection
const mongoUri = process.env.MONGO_URL;
if (!mongoUri) {
  console.error('MONGO_URL is not set. Please configure it in your .env');
  process.exit(1);
}

// Work around invalid db names (e.g., containing '.')
let dbNameOverride = process.env.MONGO_DB_NAME;
if (!dbNameOverride) {
  try {
    const parsed = new URL(mongoUri);
    const rawPath = (parsed.pathname || '').replace(/^\//, '');
    if (rawPath) {
      dbNameOverride = rawPath.replace(/\./g, '-');
    }
  } catch (_) {}
}

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    ...(dbNameOverride ? { dbName: dbNameOverride } : {}),
  })
  .then(() => {
    // Start server only after DB is connected
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});


