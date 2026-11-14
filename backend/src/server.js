import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security Headers Middleware
app.use(helmet());

// CORS Configuration - Allows configured client origin and standard local development ports
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server) or matched origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// General Rate Limiting Middleware
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', globalLimiter);

// JSON Body Parser with Payload Limit (10kb prevents large payload DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SOES API is running',
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Centralized Server Startup Function
export const startServer = async () => {
  try {
    // Attempt database connection (graceful, non-fatal if offline)
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`[Server] SOES API is running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(`[Server] Health check available at: http://localhost:${PORT}/api/health`);
    });

    // Graceful Shutdown Handling
    const handleShutdown = (signal) => {
      console.log(`\n[Server] ${signal} signal received: closing HTTP server`);
      server.close(() => {
        console.log('[Server] HTTP server closed gracefully.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('[Server Startup Error]:', error.message || error);
    process.exit(1);
  }
};

// Execute startup when run directly
startServer();

export default app;
