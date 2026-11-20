require('dotenv').config();

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8080,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenTtlMs: 20 * 24 * 60 * 60 * 1000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ||
    'http://localhost:8080/api/auth/google/callback',
  isProd: process.env.NODE_ENV === 'production',
};

env.cookieSameSite = (process.env.COOKIE_SAME_SITE || (env.isProd ? 'none' : 'lax')).toLowerCase();
if (!['lax', 'strict', 'none'].includes(env.cookieSameSite)) {
  throw new Error('COOKIE_SAME_SITE must be lax, strict, or none');
}
env.cookieSecure = env.isProd || env.cookieSameSite === 'none';

module.exports = env;
