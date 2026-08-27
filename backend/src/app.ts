import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { notFoundHandler } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponse } from './utils/apiResponse';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || env.isDevelopment) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// HTTP Request logging
if (env.isDevelopment) {
  app.use(morgan('dev'));
} else if (!env.isTest) {
  app.use(morgan('combined'));
}

// System Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  return ApiResponse.success(
    res,
    {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'Savvy Scholar Financial Intelligence API',
      environment: env.NODE_ENV,
    },
    'Server is healthy and operational'
  );
});

// Import route modules
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import expenseRoutes from './routes/expense.routes';
import budgetRoutes from './routes/budget.routes';
import savingsGoalRoutes from './routes/savingsGoal.routes';
import investmentRoutes from './routes/investment.routes';
import insuranceRoutes from './routes/insurance.routes';
import emergencyFundRoutes from './routes/emergencyFund.routes';
import analyticsRoutes from './routes/analytics.routes';
import dashboardRoutes from './routes/dashboard.routes';

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings-goals', savingsGoalRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/emergency-fund', emergencyFundRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Catch 404 routes and forward to error handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
