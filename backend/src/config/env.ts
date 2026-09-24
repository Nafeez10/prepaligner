/**
 * Single source of truth for all environment variables.
 * Import this instead of accessing process.env directly throughout the app.
 */
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the root of the monorepo
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5005', 10),
  mongoUri:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/trao_prep_kit',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  useMockLlm: process.env.USE_MOCK_LLM === 'true',
  apiKeys: {
    gemini: process.env.GEMINI_API_KEY || '',
    groq: process.env.GROQ_API_KEY || '',
    cohere: process.env.COHERE_API_KEY || '',
  },
} as const;
