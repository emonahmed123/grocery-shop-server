import mongoose from 'mongoose';
import config from './index';

let connection: Promise<typeof mongoose> | null = null;

// One shared connection per process (the local server or a Vercel function
// instance). A failed attempt is dropped so the next request tries again.
export const connectDB = () => {
  if (!config.database_url) {
    return Promise.reject(new Error('DATABASE_URL is not set'));
  }
  if (!connection) {
    connection = mongoose
      // Fail before Vercel's function timeout instead of hanging.
      .connect(config.database_url, { serverSelectionTimeoutMS: 5000 })
      .catch((err) => {
        connection = null;
        throw err;
      });
  }
  return connection;
};
