/**
 * System Health Check API
 * GET /api/health - Check system status
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateMongoDBConnection, getConnectionStatus } from '@/lib/mongodb-validator';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // 1. MongoDB Connection Check
  try {
    const mongoStatus = getConnectionStatus();
    
    if (!mongoStatus.connected) {
      // Try to validate connection
      const validation = await validateMongoDBConnection();
      health.checks.mongodb = {
        status: validation.success ? 'healthy' : 'unhealthy',
        message: validation.message,
        error: validation.error,
        suggestions: validation.suggestions,
        details: validation.details,
      };
      
      if (!validation.success) {
        health.status = 'unhealthy';
      }
    } else {
      health.checks.mongodb = {
        status: 'healthy',
        message: 'MongoDB connected',
        readyState: mongoStatus.readyStateText,
      };
    }
  } catch (error: any) {
    health.checks.mongodb = {
      status: 'unhealthy',
      message: 'MongoDB connection failed. Check credentials and IP whitelist.',
      error: error.message,
    };
    health.status = 'unhealthy';
  }

  // 2. Environment Variables Check
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'OPENAI_API_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  const placeholderEnvVars = requiredEnvVars.filter(varName => {
    const value = process.env[varName];
    return value && (
      value.includes('<') || 
      value.includes('your-') || 
      value.includes('change-in-production')
    );
  });

  health.checks.environment = {
    status: missingEnvVars.length === 0 && placeholderEnvVars.length === 0 ? 'healthy' : 'warning',
    missing: missingEnvVars,
    placeholders: placeholderEnvVars,
    message: missingEnvVars.length > 0 
      ? `Missing environment variables: ${missingEnvVars.join(', ')}`
      : placeholderEnvVars.length > 0
      ? `Placeholder values detected: ${placeholderEnvVars.join(', ')}`
      : 'All required environment variables are set',
  };

  if (missingEnvVars.length > 0) {
    health.status = 'unhealthy';
  } else if (placeholderEnvVars.length > 0) {
    health.status = 'warning';
  }

  // 3. OpenAI API Check
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey || openaiKey.includes('your-') || openaiKey === 'sk-your-openai-api-key-here') {
      health.checks.openai = {
        status: 'warning',
        message: 'OpenAI API key not configured or using placeholder',
        suggestion: 'Add a valid OpenAI API key to enable AI features',
      };
    } else if (!openaiKey.startsWith('sk-')) {
      health.checks.openai = {
        status: 'warning',
        message: 'OpenAI API key format appears invalid',
        suggestion: 'OpenAI API keys should start with "sk-"',
      };
    } else {
      health.checks.openai = {
        status: 'healthy',
        message: 'OpenAI API key configured',
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      };
    }
  } catch (error: any) {
    health.checks.openai = {
      status: 'warning',
      message: 'Could not verify OpenAI configuration',
      error: error.message,
    };
  }

  // 4. JWT Secret Check
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'your-secret-key-change-in-production' || jwtSecret.length < 32) {
    health.checks.jwt = {
      status: 'warning',
      message: 'JWT secret is weak or using default value',
      suggestion: 'Generate a strong JWT secret using: node generate-jwt-secret.js',
    };
    if (health.status === 'healthy') {
      health.status = 'warning';
    }
  } else {
    health.checks.jwt = {
      status: 'healthy',
      message: 'JWT secret configured',
    };
  }

  // 5. Response Time
  const responseTime = Date.now() - startTime;
  health.responseTime = `${responseTime}ms`;

  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
