const env = require('./config/env'); // loads .env and checks required values first
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');

async function start() {
  await connectDB(env.mongoUri);

  const server = app.listen(env.port, () => {
    console.log(`Dot API running on port ${env.port} (${env.nodeEnv})`);
  });

  // Finish in-flight requests, then close the database, when the server is asked to stop.
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
