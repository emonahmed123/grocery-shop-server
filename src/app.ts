import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import gobleErrorhandler from './app/middleware/gobleErrorhandler';
import notFound from './app/middleware/Notfound';
import { connectDB } from './app/config/db';
import AppError from './app/error/AppError';
import config from './app/config';

const app = express();

// a browser may only send its auth cookies from the store itself (and the
// local store while developing); the store's server calls the API
// server-to-server, where CORS does not apply
const allowedOrigins = [
  config.client_url,
  config.node_env !== 'production' ? 'http://localhost:3000' : undefined,
].filter((origin): origin is string => Boolean(origin));

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API requests wait for the database, so a bad connection answers with a
// clear error instead of timing out.
app.use('/api/', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(new AppError(503, `Database connection failed: ${(err as Error).message}`));
  }
});
app.use('/api/', router);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(gobleErrorhandler);
app.use(notFound);
export default app;
