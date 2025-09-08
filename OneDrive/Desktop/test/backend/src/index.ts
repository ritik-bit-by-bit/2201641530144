import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { requestLogger, errorLogger } from './middleware/logger';
import shorturlsRouter from './routes/shorturls';
import redirectRouter from './routes/redirect';
import InMemoryStorage from './services/storage';
import Logger from './middleware/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const logger = Logger.getInstance();
const storage = InMemoryStorage.getInstance();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.229.158:3000',
    'http://192.168.137.1:3000'
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Custom logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/shorturls', shorturlsRouter);

// Redirect routes (must be after API routes to avoid conflicts)
app.use('/', redirectRouter);

// Error handling middleware
app.use(errorLogger);

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', { method: req.method, url: req.url });
  res.status(404).json({
    error: 'NotFoundError',
    message: 'Route not found',
    statusCode: 404
  });
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { 
    error: error.message, 
    stack: error.stack,
    method: req.method,
    url: req.url
  });
  
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    statusCode: 500
  });
});

// Cleanup expired URLs every 5 minutes
setInterval(() => {
  storage.cleanup();
}, 5 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  });
  
  console.log(`🚀 URL Shortener API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API docs: http://localhost:${PORT}/shorturls`);
});

export default app;
