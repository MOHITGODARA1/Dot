const { Server } = require('socket.io');
const env = require('./env');
const { verifyToken } = require('../utils/jwt');
const { setSocketServer } = require('./realtime');

function attachSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const payload = verifyToken(token);
      if (!payload?.sub || payload.type !== 'access' || !payload.sessionExp || payload.sessionExp <= Math.floor(Date.now() / 1000)) {
        return next(new Error('Invalid authentication token'));
      }
      socket.data.userId = payload.sub;
      return next();
    } catch {
      return next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.userId}`);
    const payload = verifyToken(socket.handshake.auth.token);
    const expiry = Math.min(payload.exp, payload.sessionExp) * 1000;
    const expirationDelay = Math.max(0, expiry - Date.now());
    const expirationTimer = setTimeout(() => socket.conn.close(), expirationDelay);
    socket.on('disconnect', () => clearTimeout(expirationTimer));
  });

  setSocketServer(io);
  return io;
}

module.exports = { attachSocketServer };
