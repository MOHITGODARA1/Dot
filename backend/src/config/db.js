const mongoose = require('mongoose');
const env = require('./env');

let memoryServer = null;

async function resolveUri() {
  if (env.mongodbUri !== 'memory') {
    return env.mongodbUri;
  }

  const { MongoMemoryReplSet } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = memoryServer.getUri('dot');
  console.log('Using in-memory MongoDB (dev only)');
  return uri;
}

async function connectDB() {
  mongoose.set('strictQuery', true);

  const uri = await resolveUri();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

async function disconnectDB() {
  await mongoose.connection.close();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

module.exports = { connectDB, disconnectDB };
