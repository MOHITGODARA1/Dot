const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken(payload) {
  const sessionExp = payload.sessionExp || Math.floor((Date.now() + env.refreshTokenTtlMs) / 1000);
  return jwt.sign({ ...payload, type: 'access', sessionExp }, env.jwtSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { signToken, verifyToken };
