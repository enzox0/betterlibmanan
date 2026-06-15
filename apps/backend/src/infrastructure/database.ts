import mongoose from 'mongoose';
import { logger } from '../shared/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/betterlibmanan';

    // Log which database we're connecting to (redact credentials)
    const redacted = mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//<redacted>@');
    logger.info(`Connecting to database: ${redacted}`);

    await mongoose.connect(mongoURI, {
      // Timeout after 10 s if the initial handshake fails — prevents the
      // process from hanging silently when the URI is unreachable.
      serverSelectionTimeoutMS: 10_000,
      // Keep idle connections alive (important for Atlas serverless clusters).
      socketTimeoutMS: 45_000,
    });

    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('Database disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('Database error:', error);
});
