const mongoose = require('mongoose');

async function connectDB(uri) {
  // maxPoolSize lets many requests talk to MongoDB in parallel.
  // 50 is plenty for one server instance.
  await mongoose.connect(uri, {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
  });
  console.log('MongoDB connected');
}

module.exports = connectDB;
