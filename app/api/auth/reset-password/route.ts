/**
 * Reset Password API Route
 * POST /api/auth/reset-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, validatePasswordStrength } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    console.log('🔐 Password reset attempt for:', email);

    // Validate inputs
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email, OTP, and new password are required',
        },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOTP = otp.trim();

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: passwordValidation.errors[0],
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired reset code',
        },
        { status: 400 }
      );
    }

    // Check if OTP exists and is not expired
    if (!user.resetOTP || !user.resetOTPExpires) {
      return NextResponse.json(
        {
          success: false,
          message: 'No reset request found. Please request a new reset code.',
        },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > user.resetOTPExpires) {
      return NextResponse.json(
        {
          success: false,
          message: 'Reset code has expired. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.resetOTP !== trimmedOTP) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid reset code',
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    user.resetAttempts = 0;
    user.resetLockedUntil = undefined;
    user.lastPasswordReset = new Date();

    // Optional: Add to password history to prevent reuse
    if (!user.passwordHistory) {
      user.passwordHistory = [];
    }
    user.passwordHistory.push(hashedPassword);
    // Keep only last 5 passwords
    if (user.passwordHistory.length > 5) {
      user.passwordHistory = user.passwordHistory.slice(-5);
    }

    await user.save();

    console.log('✅ Password reset successful for:', email);

    return NextResponse.json(
      {
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Reset password error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
