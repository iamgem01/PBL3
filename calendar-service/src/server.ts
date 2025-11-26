import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database';
import eventRoutes from './routes/eventRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5003;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'Calendar Service',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', eventRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log(`📅 Calendar Service running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  console.log('🚀 ========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⏹️  SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⏹️  SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;