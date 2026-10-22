import { Server } from 'http';
import app from './app';
import config from './app/config';
import { connectDB } from './app/config/db';
let server: Server;
async function main() {
  try {
    await connectDB();

    // On Vercel the exported app runs as a function, so only listen locally.
    if (!process.env.VERCEL) {
      server = app.listen(config.port, () => {
        console.log(`server listening on port ${config.port}`);
      });
    }
  } catch (err) {
    console.log(err);
  }
}
main();
process.on('unhandledRejection', () => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});

export default app;
