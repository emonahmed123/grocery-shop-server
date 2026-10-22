import express from 'express';
import cors from 'cors';
import router from './app/routes';
import gobleErrorhandler from './app/middleware/gobleErrorhandler';
import notFound from './app/middleware/Notfound';
import { connectDB } from './app/config/db';
import AppError from './app/error/AppError';

const app = express();

app.use(cors());
app.use(express.json());

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
