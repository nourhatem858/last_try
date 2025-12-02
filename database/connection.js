/**
 * MongoDB Connection Manager
 * Handles database connection lifecycle
 */

const mongoose = require('mongoose');
const config = require('./config/mongodb.config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      console.log('Using existing database connection');
      return;
    }

    try {
      await mongoose.connect(dbConfig.uri, dbConfig.options);
      this.isConnected = true;
      console.log(`MongoDB connected successfully to ${env} database`);

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
      });

      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }

  getConnection() {
    return mongoose.connection;
  }
}

module.exports = new DatabaseConnection();
