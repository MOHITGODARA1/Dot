const express = require('express');
const controller = require('../controllers/user.controller');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/auth.validators');

const router = express.Router();

router.get('/me', requireAuth, controller.getMe);
router.patch('/me', requireAuth, validate(schemas.updateMe), controller.updateMe);

module.exports = router;
