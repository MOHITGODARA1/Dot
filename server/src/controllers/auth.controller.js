const bcrypt = require('bcryptjs');
const env = require('../config/env');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const generateInviteCode = require('../utils/inviteCode');
const serializeUser = require('../utils/serializeUser');
const { issueTokens, hashToken } = require('../utils/tokens');

// Used when the email is unknown, so a login for a missing account takes as long as a real
// one. Otherwise response time would reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', env.bcryptRounds);

// POST /api/auth/register  (AUTH-01, AUTH-02)
async function register(req, res) {
  const { name, email, password, timezone } = req.body;

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

  let user = null;
  for (let attempt = 0; attempt < 5 && !user; attempt += 1) {
    try {
      user = await User.create({
        name,
        email,
        passwordHash,
        inviteCode: generateInviteCode(),
        timezone: timezone || 'UTC',
      });
    } catch (err) {
      if (err.code !== 11000) throw err; // not a duplicate-key error
      if (err.keyPattern && err.keyPattern.email) {
        throw new ApiError(409, 'EMAIL_TAKEN', 'That email is already registered. Try logging in instead.');
      }
      // Otherwise the random invite code collided with an existing one: loop and try a new one.
    }
  }
  if (!user) throw new ApiError(500, 'INTERNAL', 'Something went wrong on our side. Please try again.');

  const tokens = await issueTokens(user._id);
  res.status(201).json({ user: serializeUser(user), ...tokens });
}

// POST /api/auth/login  (AUTH-03)
async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  const passwordOk = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !passwordOk) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', "That email and password don't match. Please try again.");
  }

  const tokens = await issueTokens(user._id);
  res.json({ user: serializeUser(user), ...tokens });
}

// POST /api/auth/refresh  (AUTH-04: keeps the user signed in)
// Each refresh token works once: we delete it and hand out a new one (rotation).
async function refresh(req, res) {
  const { refreshToken } = req.body;

  const stored = await RefreshToken.findOneAndDelete({
    tokenHash: hashToken(refreshToken),
    expiresAt: { $gt: new Date() },
  });
  if (!stored) {
    throw new ApiError(401, 'REFRESH_INVALID', 'Your session has ended. Please log in again.');
  }

  const user = await User.findById(stored.userId);
  if (!user) {
    throw new ApiError(401, 'REFRESH_INVALID', 'Your session has ended. Please log in again.');
  }

  const tokens = await issueTokens(user._id);
  res.json(tokens);
}

// POST /api/auth/logout  (AUTH-05)
// Deletes this device's refresh token. Safe to call twice. The app should also delete
// its stored tokens locally.
async function logout(req, res) {
  await RefreshToken.deleteOne({ tokenHash: hashToken(req.body.refreshToken) });
  res.status(204).end();
}

module.exports = { register, login, refresh, logout };
