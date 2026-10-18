const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/tokens');

// Put this in front of any route that needs a logged-in user.
// It sets req.user.id. Later issues (habits, timeline, partner) will reuse it.
function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Please log in to continue.'));
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub };
    return next();
  } catch (err) {
    // The app uses TOKEN_EXPIRED as the signal to call /api/auth/refresh and retry.
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
    return next(new ApiError(401, code, 'Your session has ended. Please log in again.'));
  }
}

module.exports = requireAuth;
