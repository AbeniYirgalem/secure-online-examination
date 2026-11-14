import mongoose from 'mongoose';

let memoryServerInstance = null;

/**
 * Connect to MongoDB database via Mongoose.
 * If MONGODB_URI is provided, connects to that URI.
 * In development/test environments without a live MongoDB daemon,
 * falls back to an in-memory MongoDB instance to ensure authentication
 * and security test suites function reliably without external dependencies.
 */
export const connectDatabase = async (customUri = null) => {
  let uri = customUri || process.env.MONGODB_URI;

  if (!uri && process.env.NODE_ENV !== 'production') {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      if (!memoryServerInstance) {
        memoryServerInstance = await MongoMemoryServer.create();
      }
      uri = memoryServerInstance.getUri();
      console.log(`[Database] In-memory MongoDB instance active at: ${uri}`);
    } catch (memErr) {
      console.warn(`[Database] In-memory MongoDB initialization skipped: ${memErr.message}`);
    }
  }

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
    return null;
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
    }
  } catch (error) {
    console.error('[Database] Disconnect error:', error.message);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database] MongoDB runtime error: ${err.message}`);
});

export default connectDatabase;
