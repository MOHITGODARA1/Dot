const crypto = require('node:crypto');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Connection = require('../models/Connection');
const ConnectionCode = require('../models/ConnectionCode');
const { emitConnectionUpdate } = require('../config/realtime');

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const CODE_LIFETIME_MS = 10 * 60 * 1000;

function createCode() {
  let code = '';
  while (code.length < CODE_LENGTH) {
    for (const byte of crypto.randomBytes(12)) {
      // The alphabet has 32 characters, so a five-bit mask is unbiased.
      code += CODE_ALPHABET[byte & 31];
      if (code.length === CODE_LENGTH) break;
    }
  }
  return code;
}

function publicProfile(user) {
  return { id: user._id, name: user.name, email: user.email, avatar: user.avatar || '' };
}

async function getStatus(userId) {
  const user = await User.findById(userId).select('connectionId');
  if (!user) throw new ApiError(404, 'User not found');

  if (user.connectionId) {
    const connection = await Connection.findById(user.connectionId).lean();
    if (connection) {
      const partnerId = connection.members.find((id) => id.toString() !== userId.toString());
      const partner = partnerId ? await User.findById(partnerId).select('name email avatar') : null;
      if (partner) {
        return { status: 'connected', connectedAt: connection.connectedAt, partner: publicProfile(partner) };
      }
    }
  }

  const activeCode = await ConnectionCode.findOne({
    ownerId: userId,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  }).select('code expiresAt');

  if (activeCode) return { status: 'waiting', code: activeCode.code, expiresAt: activeCode.expiresAt };
  return { status: 'not_connected' };
}

async function generateCode(userId) {
  const user = await User.findById(userId).select('connectionId');
  if (!user) throw new ApiError(404, 'User not found');
  if (user.connectionId) throw new ApiError(409, 'You are already connected');

  const now = new Date();
  const current = await ConnectionCode.findOne({ ownerId: userId, usedAt: null, expiresAt: { $gt: now } });
  if (current) return { code: current.code, expiresAt: current.expiresAt };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const expiresAt = new Date(Date.now() + CODE_LIFETIME_MS);
      const result = await ConnectionCode.findOneAndUpdate(
        { ownerId: userId },
        { $set: { code: createCode(), expiresAt, usedAt: null } },
        { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
      );
      return { code: result.code, expiresAt: result.expiresAt };
    } catch (error) {
      if (error.code === 11000) {
        const racedCode = await ConnectionCode.findOne({ ownerId: userId, usedAt: null, expiresAt: { $gt: new Date() } });
        if (racedCode) return { code: racedCode.code, expiresAt: racedCode.expiresAt };
        continue;
      }
      throw error;
    }
  }
  throw new ApiError(503, 'Could not create a connection code. Please try again.');
}

async function connectWithCode(userId, submittedCode) {
  const code = submittedCode.trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) {
    throw new ApiError(400, 'Enter a valid 6-character connection code');
  }

  const session = await mongoose.startSession();
  let connectedIds;
  try {
    await session.withTransaction(async () => {
      const codeRecord = await ConnectionCode.findOne({ code }).session(session);
      if (!codeRecord || codeRecord.usedAt || codeRecord.expiresAt <= new Date()) {
        throw new ApiError(400, 'This connection code is invalid, expired, or already used');
      }

      const ownerId = codeRecord.ownerId.toString();
      const requesterId = userId.toString();
      if (ownerId === requesterId) throw new ApiError(400, 'You cannot connect with your own code');

      const users = await User.find({ _id: { $in: [ownerId, requesterId] } }).select('_id connectionId').session(session);
      if (users.length !== 2) throw new ApiError(404, 'One of these accounts could not be found');
      if (users.some((account) => account.connectionId)) {
        throw new ApiError(409, 'One of these accounts is already connected');
      }

      const claimedCode = await ConnectionCode.findOneAndUpdate(
        { _id: codeRecord._id, usedAt: null, expiresAt: { $gt: new Date() } },
        { $set: { usedAt: new Date() } },
        { returnDocument: 'after', session }
      );
      if (!claimedCode) throw new ApiError(400, 'This connection code is invalid, expired, or already used');

      const sortedIds = [ownerId, requesterId].sort();
      const connectionId = new mongoose.Types.ObjectId();
      await ConnectionCode.updateMany(
        { ownerId: { $in: sortedIds }, usedAt: null },
        { $set: { usedAt: new Date() } },
        { session }
      );
      await Connection.create([{
        _id: connectionId,
        members: sortedIds,
        memberKey: sortedIds.join(':'),
      }], { session });

      const updates = await Promise.all(sortedIds.map((id) =>
        User.updateOne({ _id: id, connectionId: { $exists: false } }, { $set: { connectionId } }, { session })
      ));
      if (updates.some((result) => result.matchedCount !== 1)) {
        throw new ApiError(409, 'One of these accounts has already connected with someone else');
      }

      connectedIds = sortedIds;
    });
  } finally {
    await session.endSession();
  }

  if (!connectedIds) throw new ApiError(500, 'Connection could not be completed');
  const status = await Promise.all(connectedIds.map((id) => getStatus(id)));
  emitConnectionUpdate(connectedIds, { status: 'connected' });
  return status[connectedIds.indexOf(userId.toString())];
}

module.exports = { getStatus, generateCode, connectWithCode };
