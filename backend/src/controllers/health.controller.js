const mongoose = require('mongoose');

function getHealth(req, res) {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    }[dbState] || 'unknown';

  res.status(200).json({
    success: true,
    message: 'Dot API is running',
    data: {
      status: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { getHealth };
