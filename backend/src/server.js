const app = require('./app');
const http = require('node:http');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { attachSocketServer } = require('./config/socket');

async function start() {
  try {
    await connectDB();

    const server = http.createServer(app);
    const io = attachSocketServer(server);
    server.listen(env.port, () => {
      console.log(
        `Dot API listening on http://localhost:${env.port} (${env.nodeEnv})`
      );
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down...`);
      io.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
