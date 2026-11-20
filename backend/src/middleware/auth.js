const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Requires a valid Bearer JWT and attaches req.user.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = header.slice(7);
  const decoded = verifyToken(token);
  if (decoded.type !== 'access' || !decoded.sessionExp || decoded.sessionExp <= Math.floor(Date.now() / 1000)) {
    throw new ApiError(401, 'Invalid access token');
  }

  const user = await User.findById(decoded.sub).select('-password');

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  req.user = user;
  next();
});

module.exports = { requireAuth };
