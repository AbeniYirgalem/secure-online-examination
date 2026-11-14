import mongoose from 'mongoose';

/**
 * Connect to MongoDB database via Mongoose.
 * Gracefully handles connection failures so that the server can still start
 * and respond to health checks when MongoDB is not running locally.
 */
export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[Database] MONGODB_URI is not configured. Database connection skipped.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database] MongoDB connection failed: ${error.message}`);
    // Do not call process.exit(1) to allow standalone server operation and testing
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database] MongoDB runtime error: ${err.message}`);
});

export default connectDatabase;

