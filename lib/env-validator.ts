/**
 * Environment Variables Validator
 * Ensures all required environment variables are set
 */

interface EnvConfig {
  MONGODB_URI: string;
  JWT_SECRET: string;
  OPENAI_API_KEY?: string;
  NODE_ENV: string;
}

export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Required variables
  const MONGODB_URI = process.env.MONGODB_URI;
  const JWT_SECRET = process.env.JWT_SECRET;
  const NODE_ENV = process.env.NODE_ENV || 'development';

  if (!MONGODB_URI) {
    errors.push('MONGODB_URI is not set in environment variables');
  }

  if (!JWT_SECRET) {
    errors.push('JWT_SECRET is not set in environment variables');
  }

  // Optional but recommended
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY is not set - AI features will be disabled');
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    throw new Error('Missing required environment variables. Check .env.local file.');
  }

  console.log('✅ Environment variables validated successfully');

  return {
    MONGODB_URI: MONGODB_URI!,
    JWT_SECRET: JWT_SECRET!,
    OPENAI_API_KEY,
    NODE_ENV,
  };
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    console.error(error);
  }
}
