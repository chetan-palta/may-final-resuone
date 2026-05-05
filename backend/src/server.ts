import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Polyfills for pdfjs-dist to work in modern Node versions
if (typeof global !== 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {};
  (global as any).ImageData = class ImageData {};
  (global as any).Path2D = class Path2D {};
}

import { initDb } from './config/db';
import resumeRoutes from './routes/resumeRoutes';
import aiRoutes from './routes/ai';
import importRoutes from './routes/importRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://resuone.vercel.app'
  ],
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:; media-src * data: blob:;");
  next();
});

app.use(express.json());
app.use(cookieParser());

// Init DB
initDb().catch(e => console.error("DB Init failed but continuing:", e));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resume', importRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => res.send('Backend running'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
