const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const RefreshToken = require('../models/RefreshToken');

// Access token: short-lived JWT. Checking it needs no database call, which keeps every
// protected request fast and lets you run several servers without shared session storage.
function signAccessToken(userId) {
  return jwt.sign({}, env.accessSecret, {
    subject: String(userId),
    expiresIn: env.accessTtl,
    algorithm: 'HS256',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.accessSecret, { algorithms: ['HS256'] });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Refresh token: random opaque string, stored hashed, valid for REFRESH_TOKEN_TTL_DAYS.
// This is what keeps the user signed in until they log out (AUTH-04).
async function issueTokens(userId) {
  const refreshToken = crypto.randomBytes(48).toString('hex');
  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + env.refreshTtlDays * 24 * 60 * 60 * 1000),
  });
  return { accessToken: signAccessToken(userId), refreshToken };
}

module.exports = { signAccessToken, verifyAccessToken, hashToken, issueTokens };
