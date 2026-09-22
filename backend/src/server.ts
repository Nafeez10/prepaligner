import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { AuthController } from './controllers/AuthController';
import { KitController } from './controllers/KitController';
import { LLMController } from './controllers/LLMController';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/trao_prep_kit';

// Middleware
app.use(cors());
app.use(express.json());

// Routes - Auth
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.get('/api/auth/me', authMiddleware, AuthController.me);

// Routes - LLM
app.get('/api/llm/providers', authMiddleware, LLMController.getProviders);

// Routes - Kits
app.post('/api/kits', authMiddleware, KitController.createKit);
app.get('/api/kits', authMiddleware, KitController.getKits);
app.get('/api/kits/:id/status', authMiddleware, KitController.getKitStatus);
app.get('/api/kits/:id', authMiddleware, KitController.getKit);
app.delete('/api/kits/:id', authMiddleware, KitController.deleteKit);
app.put('/api/kits/:id/data', authMiddleware, KitController.updateKitData);
app.post('/api/kits/:id/retry', authMiddleware, KitController.retryKit);

// Single section regeneration placeholder
app.post('/api/kits/:id/regenerate-section', authMiddleware, KitController.regenerateSection);

// Database Connection & Server Start
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB at ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
