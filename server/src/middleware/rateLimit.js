const rateLimit = require('express-rate-limit');

function limiter(windowMs, limit, message) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ error: { code: 'RATE_LIMITED', message } }),
  });
}

// Strict limit on sign-up / login / refresh to slow down password guessing (NFR-SEC-06).
const authLimiter = limiter(
  15 * 60 * 1000,
  30,
  'Too many attempts. Please wait a few minutes and try again.'
);

// Gentle limit on everything else so one client cannot hog the server.
const generalLimiter = limiter(60 * 1000, 300, 'Slow down a little. Please try again in a minute.');

// NOTE: counters live in this server's memory. If you run several server copies later,
// switch to a shared store (for example Redis) so the limit applies across all of them.
module.exports = { authLimiter, generalLimiter };
