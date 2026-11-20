const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const connectionRoutes = require('./connection.routes');
const taskRoutes = require('./task.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/connections', connectionRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
