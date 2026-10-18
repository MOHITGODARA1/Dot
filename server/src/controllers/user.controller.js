const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const serializeUser = require('../utils/serializeUser');

// GET /api/users/me
// (Partner details will be added here when the partner-connection issue is built.)
async function getMe(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'Please log in to continue.');
  res.json({ user: serializeUser(user) });
}

// PATCH /api/users/me  (PRF-01 name, AUTH-07 time zone)
async function updateMe(req, res) {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'Please log in to continue.');
  res.json({ user: serializeUser(user) });
}

module.exports = { getMe, updateMe };
