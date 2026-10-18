const express = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const schemas = require('../validators/auth.validators');

const router = express.Router();

router.post('/register', authLimiter, validate(schemas.register), controller.register);
router.post('/login', authLimiter, validate(schemas.login), controller.login);
router.post('/refresh', authLimiter, validate(schemas.refreshToken), controller.refresh);
router.post('/logout', validate(schemas.refreshToken), controller.logout);

module.exports = router;
