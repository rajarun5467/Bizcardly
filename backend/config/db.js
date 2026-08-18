const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const isDbConnected = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      const message = 'Database is not configured. Set MONGO_URI to a reachable MongoDB instance.';
      console.log(`⚠️  ${message}`);
      return { connected: false, message };
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      autoIndex: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return { connected: true, connection: conn.connection };
  } catch (error) {
    const message = `Database unavailable: ${error.message}`;
    console.error(`❌ MongoDB Connection Error: ${message}`);
    throw new Error(message);
  }
};

const ensureDbConnection = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('Database is not configured. Set MONGO_URI to a reachable MongoDB instance.');
  }

  if (!isDbConnected()) {
    await connectDB();
  }

  if (!isDbConnected()) {
    throw new Error('Database unavailable. MongoDB connection could not be established.');
  }

  return mongoose.connection;
};

module.exports = {
  connectDB,
  ensureDbConnection,
  isDbConnected,
};
