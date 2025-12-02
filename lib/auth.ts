/**
 * Authentication Utility
 * JWT token verification and user extraction
 */

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Extract and verify JWT token from request headers
 * @param request - Next.js request object
 * @returns Decoded JWT payload or null if invalid
 */
export function verifyToken(request: NextRequest): JWTPayload | null {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.log('❌ No authorization header found');
      return null;
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      console.log('❌ No token found in authorization header');
      return null;
    }

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    console.log('✅ Token verified for user:', decoded.email);
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.log('❌ Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('❌ Invalid token');
    } else {
      console.log('❌ Token verification error:', error.message);
    }
    return null;
  }
}

/**
 * Get user ID from JWT token
 * @param request - Next.js request object
 * @returns User ID or null if invalid
 */
export function getUserIdFromToken(request: NextRequest): string | null {
  const payload = verifyToken(request);
  return payload?.id || null;
}
