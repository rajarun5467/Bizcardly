const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log('⚠️  MONGO_URI not found in environment variables');
      console.log('⚠️  Server will continue without database (development mode)');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Server will continue without database (development mode)');
    // Don't exit, allow server to run without DB for development
  }
};

module.exports = connectDB;
