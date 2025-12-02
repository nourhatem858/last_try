/**
 * Verify OTP API - Validate the OTP code
 * POST /api/auth/verify-otp
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if account is locked
    if (user.resetLockedUntil && new Date() < user.resetLockedUntil) {
      const remainingTime = Math.ceil((user.resetLockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many attempts. Please try again in ${remainingTime} minutes.`,
          locked: true,
        },
        { status: 429 }
      );
    }

    // Check if OTP exists
    if (!user.resetOTP || !user.resetOTPExpires) {
      return NextResponse.json(
        { success: false, error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (new Date() > user.resetOTPExpires) {
      user.resetOTP = undefined;
      user.resetOTPExpires = undefined;
      await user.save();

      return NextResponse.json(
        { success: false, error: 'Verification code expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.resetOTP !== otp.trim()) {
      // Increment failed attempts
      user.resetAttempts = (user.resetAttempts || 0) + 1;

      // Lock account after 3 failed attempts
      if (user.resetAttempts >= 3) {
        user.resetLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        user.resetAttempts = 0;
        await user.save();

        console.log('🔒 Account locked due to too many attempts:', email);

        return NextResponse.json(
          {
            success: false,
            error: 'Too many attempts. Please try again later.',
            locked: true,
          },
          { status: 429 }
        );
      }

      await user.save();

      const remainingAttempts = 3 - user.resetAttempts;
      return NextResponse.json(
        {
          success: false,
          error: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // OTP is valid - generate a temporary reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Store reset token (valid for 10 minutes)
    user.resetOTP = resetToken; // Reuse field for reset token
    user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.resetAttempts = 0;
    await user.save();

    console.log('✅ OTP verified for:', email);

    return NextResponse.json({
      success: true,
      message: 'Verification successful. You can now reset your password.',
      resetToken, // Send this to client for password reset
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
