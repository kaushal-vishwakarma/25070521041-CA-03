import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve server/.env relative to THIS file, so it works no matter where
// the command is started from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Create server/.env from server/.env.example and fill in the values.');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters. Generate one with:');
  console.error(`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`);
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';

const env = {
  NODE_ENV: nodeEnv,
  isProduction: nodeEnv === 'production',
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: '7d',
  CLIENT_URL: process.env.CLIENT_URL,
};

export default env;
