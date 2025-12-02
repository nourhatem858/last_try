/**
 * User Model - MongoDB Schema
 */

import mongoose from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: string;
  bio?: string;
  favoriteTopics?: string[];
  theme?: 'light' | 'dark';
  avatar?: string;
  passwordHistory?: string[];
  resetOTP?: string;
  resetOTPExpires?: Date;
  resetAttempts?: number;
  resetLockedUntil?: Date;
  lastPasswordReset?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    bio: {
      type: String,
      default: '',
    },
    favoriteTopics: {
      type: [String],
      default: [],
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    avatar: {
      type: String,
      default: '',
    },
    passwordHistory: {
      type: [String],
      default: [],
    },
    resetOTP: {
      type: String,
      default: null,
    },
    resetOTPExpires: {
      type: Date,
      default: null,
    },
    resetAttempts: {
      type: Number,
      default: 0,
    },
    resetLockedUntil: {
      type: Date,
      default: null,
    },
    lastPasswordReset: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
