import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let memoryServer: any = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);

    // Attempt primary connection with 3000ms timeout
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    };

    logger.info(`Attempting MongoDB connection to: ${env.MONGODB_URI}`);
    await mongoose.connect(env.MONGODB_URI, options);
    logger.info('✅ Successfully connected to MongoDB database.');
  } catch (err: any) {
    if (env.isDevelopment || env.isTest) {
      logger.warn(
        `⚠️ Local MongoDB unavailable (${err.message}). Initializing development MongoMemoryServer fallback...`
      );

      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri();

        await mongoose.connect(memoryUri);
        logger.info(`✅ Connected to in-memory MongoDB development instance: ${memoryUri}`);
      } catch (memErr: any) {
        logger.error('❌ Failed to start in-memory MongoDB fallback:', memErr);
        throw memErr;
      }
    } else {
      logger.error(`❌ Critical database connection error: ${err.message}`);
      throw err;
    }
  }

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB runtime connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection lost. Attempting reconnection...');
  });
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    logger.info('MongoDB disconnected cleanly.');
  } catch (err: any) {
    logger.error('Error during database disconnection:', err);
  }
};
