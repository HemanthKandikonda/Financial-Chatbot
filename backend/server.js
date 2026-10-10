import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import configRoutes from './routes/config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in local development
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/config', configRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Connect to MongoDB and start server
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/financebot';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log(`✅ Connected to MongoDB: ${uri}`);
  } catch (err) {
    console.warn(`⚠️ Could not connect to MongoDB at ${uri} (${err.message}).`);
    console.log('🔄 Attempting to start in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`✅ Connected to In-Memory MongoDB: ${memUri}`);
    } catch (memErr) {
      console.error('❌ In-Memory MongoDB failed to start:', memErr.message);
      console.log('⚠️ Starting server in degraded mode (database operations will fail until MongoDB is connected).');
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 FinanceAI Backend running on http://localhost:${PORT}`);
  });
};

connectDB();

export default app;

