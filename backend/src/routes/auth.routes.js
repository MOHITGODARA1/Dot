const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

const router = Router();

router.get('/me', requireAuth, authController.me);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/google', authController.googleStart);
router.get('/google/callback', authController.googleCallback);

module.exports = router;
