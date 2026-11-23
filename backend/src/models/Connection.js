const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    members: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
      validate: {
        validator: (members) => members.length === 2 && !members[0].equals(members[1]),
        message: 'A connection must contain two different users',
      },
      required: true,
    },
    memberKey: { type: String, required: true, unique: true },
    connectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Connection', connectionSchema);
