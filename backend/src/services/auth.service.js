const crypto = require('node:crypto');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');
const env = require('../config/env');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function createSession(user, familyId = crypto.randomUUID(), expiresAt = new Date(Date.now() + env.refreshTokenTtlMs)) {
  const refreshToken = crypto.randomBytes(48).toString('base64url');
  const tokenHash = hashRefreshToken(refreshToken);

  await RefreshToken.create({
    userId: user._id,
    familyId,
    tokenHash,
    expiresAt,
  });

  return {
    accessToken: signToken({
      sub: user._id.toString(),
      sessionExp: Math.floor(expiresAt.getTime() / 1000),
    }),
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
    user: publicUser(user),
  };
}

async function loginWithGoogle({ googleId, email, name, avatar }) {
  let user = await User.findOne({ googleId });

  if (!user) {
    user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
      if (name && !user.name) user.name = name;
      await user.save();
    } else {
      user = await User.create({ googleId, email, name, avatar: avatar || '' });
    }
  } else if (avatar && user.avatar !== avatar) {
    user.avatar = avatar;
    await user.save();
  }

  return createSession(user);
}

async function revokeFamily(familyId, revokedAt = new Date(), session) {
  await RefreshToken.updateMany(
    { familyId, revokedAt: null },
    { $set: { revokedAt } },
    session ? { session } : {}
  );
}

async function refreshSession(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new ApiError(401, 'Refresh session is missing or expired');
  }

  const tokenHash = hashRefreshToken(rawToken);
  const session = await RefreshToken.startSession();
  let outcome;
  try {
    await session.withTransaction(async () => {
      outcome = null;
      const record = await RefreshToken.findOne({ tokenHash }).select('+tokenHash').session(session);
      if (!record) {
        outcome = { error: new ApiError(401, 'Refresh session is invalid or expired') };
        return;
      }

      const now = new Date();
      if (record.revokedAt) {
        await revokeFamily(record.familyId, now, session);
        outcome = { error: new ApiError(401, 'Refresh token reuse detected. Please sign in again') };
        return;
      }
      if (record.expiresAt <= now) {
        await revokeFamily(record.familyId, now, session);
        outcome = { error: new ApiError(401, 'Refresh session has expired') };
        return;
      }

      const claimed = await RefreshToken.findOneAndUpdate(
        { _id: record._id, revokedAt: null, expiresAt: { $gt: now } },
        { $set: { revokedAt: now } },
        { returnDocument: 'after', session }
      );
      if (!claimed) {
        await revokeFamily(record.familyId, now, session);
        outcome = { error: new ApiError(401, 'Refresh token has already been used') };
        return;
      }

      const user = await User.findById(record.userId).session(session);
      if (!user) {
        await revokeFamily(record.familyId, now, session);
        outcome = { error: new ApiError(401, 'User no longer exists') };
        return;
      }

      const refreshToken = crypto.randomBytes(48).toString('base64url');
      const nextHash = hashRefreshToken(refreshToken);
      await RefreshToken.create([{
        userId: user._id,
        familyId: record.familyId,
        tokenHash: nextHash,
        expiresAt: record.expiresAt,
      }], { session });
      await RefreshToken.updateOne(
        { _id: record._id },
        { $set: { replacedByHash: nextHash } },
        { session }
      );
      outcome = {
        session: {
          accessToken: signToken({ sub: user._id.toString(), sessionExp: Math.floor(record.expiresAt.getTime() / 1000) }),
          refreshToken,
          refreshTokenExpiresAt: record.expiresAt,
          user: publicUser(user),
        },
      };
    });
  } finally {
    await session.endSession();
  }

  if (outcome?.error) throw outcome.error;
  if (!outcome?.session) throw new ApiError(401, 'Refresh session is invalid or expired');
  return outcome.session;
}

async function logout(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') return;
  const tokenHash = hashRefreshToken(rawToken);
  const session = await RefreshToken.startSession();
  try {
    await session.withTransaction(async () => {
      const record = await RefreshToken.findOne({ tokenHash }).select('+tokenHash').session(session);
      if (record) await revokeFamily(record.familyId, new Date(), session);
    });
  } finally {
    await session.endSession();
  }
}

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return publicUser(user);
}

module.exports = { loginWithGoogle, refreshSession, logout, getProfile, hashRefreshToken };
