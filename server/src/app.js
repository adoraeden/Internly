import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';

const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.CLIENT_URL) {
  throw new Error('CLIENT_URL is required in production. Set it to your frontend URL.');
}

const app = express();

// Render sits behind a proxy. This makes req.ip and secure cookies work correctly.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
if (!isProd) app.use(morgan('dev'));

// Health check: shows server and database status (also used by the host)
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'not connected',
    time: new Date().toISOString(),
  });
});

// General limit: 300 requests per 15 minutes per IP (login has its own stricter limit)
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests. Please slow down and try again shortly.' },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/resume-analyses', resumeRoutes);

// Unknown URL
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.status ? err.message : 'Something went wrong on the server',
  });
});

export default app;