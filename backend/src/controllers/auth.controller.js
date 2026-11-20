const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { getGoogleAuthUrl, getGoogleProfile } = require('../config/google');
const authService = require('../services/auth.service');
const crypto = require('node:crypto');
const {
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
  clearRefreshCookie,
  readCookie,
  assertSameOrigin,
} = require('../utils/authCookies');

const OAUTH_STATE_COOKIE = 'dot_oauth_state';
const OAUTH_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: 'lax',
  path: '/api/auth/google',
};

const me = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user._id);

  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    success: true,
    data: profile,
  });
});

function googleStart(req, res) {
  const state = crypto.randomBytes(32).toString('hex');
  res.cookie(OAUTH_STATE_COOKIE, state, { ...OAUTH_STATE_COOKIE_OPTIONS, maxAge: 5 * 60 * 1000 });
  const url = getGoogleAuthUrl(state);
  res.redirect(url);
}

const googleCallback = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { code, error } = req.query;
  const expectedState = readCookie(req, OAUTH_STATE_COOKIE);
  res.clearCookie(OAUTH_STATE_COOKIE, OAUTH_STATE_COOKIE_OPTIONS);

  if (!expectedState || typeof req.query.state !== 'string' || req.query.state !== expectedState) {
    return res.redirect(`${env.clientUrl}/?authError=${encodeURIComponent('Google sign-in expired. Please try again')}`);
  }

  if (error) {
    return res.redirect(
      `${env.clientUrl}/?authError=${encodeURIComponent('Google sign-in was cancelled')}`
    );
  }

  if (!code || typeof code !== 'string') {
    throw new ApiError(400, 'Missing Google authorization code');
  }

  const profile = await getGoogleProfile(code);

  if (!profile.emailVerified) {
    return res.redirect(
      `${env.clientUrl}/?authError=${encodeURIComponent('Google email is not verified')}`
    );
  }

  const result = await authService.loginWithGoogle(profile);
  setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
  return res.redirect(env.clientUrl);
});

const refresh = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  assertSameOrigin(req);
  const rawToken = readCookie(req, REFRESH_COOKIE_NAME);
  try {
    const session = await authService.refreshSession(rawToken);
    setRefreshCookie(res, session.refreshToken, session.refreshTokenExpiresAt);
    res.status(200).json({
      success: true,
      data: { accessToken: session.accessToken, user: session.user },
    });
  } catch (error) {
    if (error.statusCode === 401) clearRefreshCookie(res);
    throw error;
  }
});

const logout = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  assertSameOrigin(req);
  await authService.logout(readCookie(req, REFRESH_COOKIE_NAME));
  clearRefreshCookie(res);
  res.status(204).end();
});

module.exports = {
  me,
  googleStart,
  googleCallback,
  refresh,
  logout,
};
