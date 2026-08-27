import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { seedDemoData } from './config/seed';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDatabase();

    // 2. Seed initial demo dataset (idempotent - creates demo user on fresh DBs)
    await seedDemoData();

    // 3. Start HTTP Server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Savvy Scholar API server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`🔗 API Health URL: http://localhost:${env.PORT}/api/health`);
    });

    // 4. Graceful shutdown handler
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down HTTP server and DB connections...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error: any) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
