require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

function parsePublicUrl(value, name, { originOnly = false, callbackPath = false } = {}) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute URL`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error(`${name} must be an HTTP(S) URL without credentials`);
  }
  if (isProd && parsed.protocol !== 'https:') {
    throw new Error(`${name} must use HTTPS in production`);
  }
  if (parsed.search || parsed.hash) {
    throw new Error(`${name} must not include a query string or fragment`);
  }
  if (originOnly && parsed.pathname !== '/') {
    throw new Error(`${name} must contain only the frontend origin`);
  }
  if (callbackPath && parsed.pathname !== '/api/auth/google/callback') {
    throw new Error(`${name} must use /api/auth/google/callback`);
  }

  return originOnly ? parsed.origin : parsed.toString();
}

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

if (isProd && process.env.MONGODB_URI.trim().toLowerCase() === 'memory') {
  throw new Error('MONGODB_URI must use a persistent MongoDB database in production; memory is for local development only');
}

if (isProd && (process.env.JWT_SECRET.length < 43 || /change[-_ ]?me|dev[-_ ]?secret|test[-_ ]?secret|placeholder|replace[-_ ]?me/i.test(process.env.JWT_SECRET))) {
  throw new Error('JWT_SECRET must be a randomly generated secret of at least 32 bytes in production');
}

if (isProd && process.env.JWT_EXPIRES_IN && !process.env.JWT_ACCESS_EXPIRES_IN) {
  throw new Error('JWT_EXPIRES_IN is not used; set JWT_ACCESS_EXPIRES_IN (15m is recommended)');
}

const clientUrlValue = process.env.CLIENT_URL || (isProd ? '' : 'http://localhost:5173');
const googleCallbackUrlValue =
  process.env.GOOGLE_CALLBACK_URL ||
  (isProd ? '' : 'http://localhost:8080/api/auth/google/callback');

if (!clientUrlValue) throw new Error('Missing required production environment variable: CLIENT_URL');
if (!googleCallbackUrlValue) {
  throw new Error('Missing required production environment variable: GOOGLE_CALLBACK_URL');
}

const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 8080,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenTtlMs: 20 * 24 * 60 * 60 * 1000,
  clientUrl: parsePublicUrl(clientUrlValue, 'CLIENT_URL', { originOnly: true }),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: parsePublicUrl(googleCallbackUrlValue, 'GOOGLE_CALLBACK_URL', {
    callbackPath: true,
  }),
  isProd,
};

if (env.isProd && new URL(env.googleCallbackUrl).origin === env.clientUrl) {
  throw new Error('GOOGLE_CALLBACK_URL must use the backend origin, not CLIENT_URL');
}

env.cookieSameSite = (process.env.COOKIE_SAME_SITE || (env.isProd ? 'none' : 'lax')).toLowerCase();
if (!['lax', 'strict', 'none'].includes(env.cookieSameSite)) {
  throw new Error('COOKIE_SAME_SITE must be lax, strict, or none');
}
env.cookieSecure = env.isProd || env.cookieSameSite === 'none';

module.exports = env;
