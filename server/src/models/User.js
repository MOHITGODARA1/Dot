const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    // "unique: true" creates an index: fast login lookups, and no duplicate accounts
    // even when two sign-ups arrive at the same moment.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false means queries do NOT return the hash unless we explicitly ask for it.
    passwordHash: { type: String, required: true, select: false },
    inviteCode: { type: String, required: true, unique: true }, // PTN-01
    timezone: { type: String, default: 'UTC' }, // AUTH-07, e.g. "Asia/Kolkata"
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
