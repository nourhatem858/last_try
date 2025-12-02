/**
 * MongoDB Connection Validator
 * Validates MongoDB Atlas connection with detailed error reporting
 */

import mongoose from 'mongoose';

export interface ConnectionValidation {
  success: boolean;
  message: string;
  details?: {
    uri: string;
    database: string;
    cluster: string;
    readyState: number;
    readyStateText: string;
  };
  error?: string;
  suggestions?: string[];
}

const READY_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Validate MongoDB connection at startup
 */
export async function validateMongoDBConnection(): Promise<ConnectionValidation> {
  const MONGODB_URI = process.env.MONGODB_URI;

  // Check if URI is defined
  if (!MONGODB_URI) {
    return {
      success: false,
      message: 'MongoDB connection failed. Check credentials and IP whitelist.',
      error: 'MONGODB_URI environment variable is not defined',
      suggestions: [
        'Create a .env.local file in the project root',
        'Add MONGODB_URI with your MongoDB Atlas connection string',
        'Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority',
      ],
    };
  }

  // Check if URI is placeholder
  if (MONGODB_URI.includes('<username>') || MONGODB_URI.includes('<password>')) {
    return {
      success: false,
      message: 'MongoDB connection failed. Check credentials and IP whitelist.',
      error: 'MONGODB_URI contains placeholder values',
      suggestions: [
        'Replace <username> with your MongoDB Atlas username',
        'Replace <password> with your MongoDB Atlas password',
        'Replace <cluster> with your cluster name (e.g., cluster0.abc123)',
        'Replace <database> with your database name',
      ],
    };
  }

  // Parse URI to extract details
  let uriDetails: { cluster: string; database: string } = { cluster: '', database: '' };
  try {
    const uriMatch = MONGODB_URI.match(/mongodb\+srv:\/\/[^@]+@([^/]+)\/([^?]+)/);
    if (uriMatch) {
      uriDetails.cluster = uriMatch[1];
      uriDetails.database = uriMatch[2];
    }
  } catch (e) {
    // Ignore parsing errors
  }

  // Try to connect
  try {
    console.log('🔌 Validating MongoDB connection...');
    
    // Set connection timeout
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGODB_URI, connectionOptions);

    const readyState = mongoose.connection.readyState;
    const readyStateText = READY_STATES[readyState as keyof typeof READY_STATES] || 'unknown';

    if (readyState === 1) {
      console.log('✅ MongoDB connection validated successfully');
      return {
        success: true,
        message: 'MongoDB connected successfully',
        details: {
          uri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials
          database: uriDetails.database,
          cluster: uriDetails.cluster,
          readyState,
          readyStateText,
        },
      };
    } else {
      return {
        success: false,
        message: 'MongoDB connection failed. Check credentials and IP whitelist.',
        error: `Connection state: ${readyStateText}`,
        suggestions: [
          'Check if your MongoDB Atlas cluster is running',
          'Verify your username and password are correct',
          'Ensure IP address 196.128.225.174 is whitelisted in Network Access',
          'Check if your cluster is in the correct region',
        ],
      };
    }
  } catch (error: any) {
    console.error('❌ MongoDB connection validation failed:', error.message);

    const suggestions: string[] = [];

    // Provide specific suggestions based on error type
    if (error.message.includes('authentication failed')) {
      suggestions.push(
        'Username or password is incorrect',
        'Check your MongoDB Atlas credentials',
        'Ensure the user has proper database permissions'
      );
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      suggestions.push(
        'Cluster hostname is incorrect',
        'Check your cluster name in MongoDB Atlas',
        'Verify your internet connection'
      );
    } else if (error.message.includes('IP') || error.message.includes('not authorized')) {
      suggestions.push(
        'Your IP address is not whitelisted',
        'Add 196.128.225.174 to Network Access in MongoDB Atlas',
        'Or allow access from anywhere (0.0.0.0/0) for testing'
      );
    } else if (error.message.includes('timeout')) {
      suggestions.push(
        'Connection timeout - check your internet connection',
        'Verify MongoDB Atlas cluster is running',
        'Check if firewall is blocking the connection'
      );
    } else {
      suggestions.push(
        'Check MongoDB Atlas dashboard for cluster status',
        'Verify connection string format',
        'Ensure all credentials are correct'
      );
    }

    return {
      success: false,
      message: 'MongoDB connection failed. Check credentials and IP whitelist.',
      error: error.message,
      suggestions,
    };
  }
}

/**
 * Get current connection status
 */
export function getConnectionStatus(): {
  connected: boolean;
  readyState: number;
  readyStateText: string;
} {
  const readyState = mongoose.connection.readyState;
  return {
    connected: readyState === 1,
    readyState,
    readyStateText: READY_STATES[readyState as keyof typeof READY_STATES] || 'unknown',
  };
}
