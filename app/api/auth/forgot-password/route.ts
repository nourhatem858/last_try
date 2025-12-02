/**
 * Forgot Password API Route
 * POST /api/auth/forgot-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP } from '@/lib/password';
import { sendPasswordResetEmail } from '@/lib/email';

const MAX_RESET_ATTEMPTS = 5;
const RESET_LOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const OTP_EXPIRY_DURATION = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log('🔐 Password reset request for:', email);

    // Validate email
    if (!email || !email.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email is required',
        },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email: trimmedEmail });

    // Security: Don't reveal if email exists or not
    // Always return success to prevent email enumeration
    if (!user) {
      console.log('❌ User not found, but returning success for security');
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, a password reset code has been sent.',
        },
        { status: 200 }
      );
    }

    // Check if user is locked due to too many attempts
    if (user.resetLockedUntil && new Date() < user.resetLockedUntil) {
      const remainingTime = Math.ceil(
        (user.resetLockedUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          success: false,
          message: `Too many reset attempts. Please try again in ${remainingTime} minutes.`,
        },
        { status: 429 }
      );
    }

    // Check reset attempts
    if (user.resetAttempts >= MAX_RESET_ATTEMPTS) {
      // Lock the account
      user.resetLockedUntil = new Date(Date.now() + RESET_LOCK_DURATION);
      user.resetAttempts = 0;
      await user.save();

      return NextResponse.json(
        {
          success: false,
          message: 'Too many reset attempts. Please try again in 15 minutes.',
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const resetOTP = generateOTP(6);
    const resetOTPExpires = new Date(Date.now() + OTP_EXPIRY_DURATION);

    // Update user with reset token
    user.resetOTP = resetOTP;
    user.resetOTPExpires = resetOTPExpires;
    user.resetAttempts = (user.resetAttempts || 0) + 1;
    await user.save();

    console.log('✅ Reset OTP generated:', resetOTP);

    // Send email
    const emailSent = await sendPasswordResetEmail(trimmedEmail, resetOTP);

    if (!emailSent) {
      console.error('❌ Failed to send reset email');
      // Don't reveal email sending failure to user
    }

    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Forgot password error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
