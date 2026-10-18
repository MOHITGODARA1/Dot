const mongoose = require('mongoose');

// One document per signed-in device. We store only a hash of the token, so even if the
// database leaked, the tokens could not be used.
const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  // TTL index: MongoDB deletes the document automatically once this date passes.
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
