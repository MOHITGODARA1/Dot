const { Router } = require('express');
const { body } = require('express-validator');
const { rateLimit } = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const connectionController = require('../controllers/connection.controller');

const router = Router();
const connectAttemptLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => req.user._id.toString(),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    success: false,
    message: 'Too many connection attempts. Please wait a few minutes and try again.',
  }),
});

router.use(requireAuth);
router.get('/me', connectionController.getStatus);
router.post('/code', connectionController.generateCode);
router.post(
  '/connect',
  connectAttemptLimit,
  [body('code').isString().trim().isLength({ min: 6, max: 6 }).withMessage('Enter a 6-character connection code')],
  validate,
  connectionController.connect
);

module.exports = router;
