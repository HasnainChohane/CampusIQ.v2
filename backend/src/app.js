import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);

// Fallback & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
