/**
 * MongoDB Connection Utility
 * Handles connection to MongoDB with proper error handling and connection reuse
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  console.log('🔌 [MongoDB] connectDB() called');
  console.log('🔌 [MongoDB] Current readyState:', mongoose.connection.readyState);
  console.log('🔌 [MongoDB] States: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
  
  // Check if already connected using readyState
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    console.log('✅ [MongoDB] Using existing connection');
    return mongoose;
  }

  // If connection is in progress, wait for it
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ [MongoDB] Connection in progress, waiting...');
    // Wait for connection to complete
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
    });
    console.log('✅ [MongoDB] Connection completed');
    return mongoose;
  }

  // Return existing promise if available
  if (cached.promise) {
    console.log('⏳ [MongoDB] Using cached promise');
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // Create new connection
  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000,
  };

  console.log('🔌 [MongoDB] Creating new connection...');
  console.log('🔌 [MongoDB] URI:', MONGODB_URI?.substring(0, 30) + '...');

  cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
    console.log('✅ [MongoDB] Connected successfully');
    console.log('✅ [MongoDB] Database:', mongoose.connection.db?.databaseName);
    return mongoose;
  }).catch((error) => {
    console.error('❌ [MongoDB] Connection failed');
    console.error('❌ [MongoDB] Error:', error.message);
    console.error('❌ [MongoDB] Error name:', error.name);
    
    // Provide helpful error messages
    if (error.message.includes('authentication failed')) {
      console.error('💡 [MongoDB] Check your MongoDB username and password');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('💡 [MongoDB] Check your cluster hostname in the connection string');
    } else if (error.message.includes('IP') || error.message.includes('not authorized')) {
      console.error('💡 [MongoDB] Whitelist your IP in MongoDB Atlas Network Access');
      console.error('💡 [MongoDB] Or allow access from anywhere (0.0.0.0/0) for testing');
    } else if (error.message.includes('timeout')) {
      console.error('💡 [MongoDB] Connection timeout - check your internet connection');
      console.error('💡 [MongoDB] Verify MongoDB Atlas cluster is running');
    }
    
    // Clear the promise so next attempt will retry
    cached.promise = null;
    
    throw new Error(`MongoDB connection failed: ${error.message}`);
  });

  try {
    cached.conn = await cached.promise;
    console.log('✅ [MongoDB] Connection established and cached');
  } catch (e: any) {
    console.error('❌ [MongoDB] Failed to establish connection:', e.message);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
