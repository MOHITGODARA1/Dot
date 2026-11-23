const env = require('../config/env');
const ApiError = require('./ApiError');

const REFRESH_COOKIE_NAME = 'dot_refresh_session';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: '/api/auth',
  };
}

function setRefreshCookie(res, token, expiresAt) {
  const maxAge = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...refreshCookieOptions(),
    maxAge,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  const entry = header.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  if (!entry) return '';
  try {
    return decodeURIComponent(entry.slice(name.length + 1));
  } catch {
    return '';
  }
}

function assertSameOrigin(req) {
  const requestOrigin = req.get('origin');
  let expectedOrigin;
  try {
    expectedOrigin = new URL(env.clientUrl).origin;
  } catch {
    expectedOrigin = '';
  }

  if (!requestOrigin || requestOrigin !== expectedOrigin || req.get('x-dot-csrf') !== '1') {
    throw new ApiError(403, 'Request origin is not allowed');
  }
}

module.exports = {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  setRefreshCookie,
  clearRefreshCookie,
  readCookie,
  assertSameOrigin,
};
