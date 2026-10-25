import env from './config/env.js'; // must be first: loads and validates .env
import connectDB from './config/db.js';
import app from './app.js';

await connectDB(); // top-level await works because "type": "module"

const server = app.listen(env.PORT, () => {
  console.log(`CareerHub API running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
