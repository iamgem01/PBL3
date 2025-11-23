import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/ai-service';
console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/(.*@)/, '//**@'));
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected! Buffering stopped.');
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('ℹ️ MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};