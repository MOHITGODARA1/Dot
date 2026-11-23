let io = null;

function setSocketServer(socketServer) {
  io = socketServer;
}

function emitConnectionUpdate(userIds, payload) {
  if (!io) return;
  for (const userId of userIds) {
    io.to(`user:${userId}`).emit('connection:updated', payload);
  }
}

function emitTaskUpdate(userIds, payload) {
  if (!io) return;
  for (const userId of userIds) {
    io.to(`user:${userId}`).emit('tasks:updated', payload);
  }
}

module.exports = { setSocketServer, emitConnectionUpdate, emitTaskUpdate };
