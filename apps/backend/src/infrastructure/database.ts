import mongoose from 'mongoose';
import { logger } from '../shared/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/betterlibmanan';
    
    logger.info('Connecting to database...');
    
    await mongoose.connect(mongoURI);
    
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
