import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Import config after dotenv.config() so env vars are populated
import { config } from './config/env';
import { authMiddleware } from './middleware/auth';
import authRouter from './routes/auth.routes';
import kitRouter from './routes/kit.routes';
import llmRouter from './routes/llm.routes';

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/kits', authMiddleware, kitRouter);
app.use('/api/llm', authMiddleware, llmRouter);

// Database + server bootstrap
mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log(`[DB] Connected to MongoDB`);
    app.listen(config.port, () => {
      console.log(`[Server] Running on http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Connection error:', err);
    process.exit(1);
  });
