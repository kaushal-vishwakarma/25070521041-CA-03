import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import internshipRoutes from './routes/internshipRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

const app = express();

// Behind a reverse proxy (Render, Railway, ...) the real client IP comes from X-Forwarded-For.
if (env.isProduction) app.set('trust proxy', 1);

app.use(helmet()); // sets secure HTTP headers

// Only the React app's exact origin may call the API, and cookies are allowed.
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

app.use(express.json({ limit: '10kb' })); // parse JSON bodies, reject huge ones
app.use(cookieParser()); // makes req.cookies available (JWT lives in a cookie)

// Tiny request logger for development (handy for demonstrating the flow in a viva).
if (!env.isProduction) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
  });
}

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CareerHub API is running', data: { time: new Date().toISOString() } });
});

app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
