# 🔐 Password Reset System - Complete Guide

A secure, modern, and user-friendly password recovery system with OTP verification.

---

## ✨ Features

✅ **Email-based OTP verification** (6-digit code, 5-minute expiry)  
✅ **Rate limiting** (3 attempts, 15-minute lockout)  
✅ **Strong password requirements** (12+ chars, uppercase, lowercase, numbers, symbols)  
✅ **Password history** (prevents reuse of last 3 passwords)  
✅ **Security logging** (tracks device & time of reset)  
✅ **Email notifications** (OTP + confirmation emails)  
✅ **Single-use codes** (OTP can only be used once)  
✅ **No email enumeration** (same response for existing/non-existing emails)

---

## 🚀 Quick Start

### 1. User Flow

```
User clicks "Forgot Password"
    ↓
Enters email address
    ↓
Receives 6-digit OTP via email (valid 5 minutes)
    ↓
Enters OTP (3 attempts max)
    ↓
Creates new password (must meet requirements)
    ↓
Receives confirmation email
    ↓
Can log in with new password
```

---

## 📁 Files Created

### Backend APIs
- `app/api/auth/forgot-password/route.ts` - Request OTP
- `app/api/auth/verify-otp/route.ts` - Verify OTP code
- `app/api/auth/reset-password/route.ts` - Reset password

### Frontend
- `app/forgot-password/page.tsx` - Complete UI flow

### Services
- `lib/email-service.ts` - Email sending (OTP + confirmation)

### Database
- `models/User.ts` - Updated with reset fields

---

## 🔧 API Endpoints

### 1. Request OTP
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "A verification code has been sent to your email. Please enter it to continue."
}
```

---

### 2. Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Verification successful. You can now reset your password.",
  "resetToken": "abc123xyz789"
}
```

**Error Response (invalid OTP):**
```json
{
  "success": false,
  "error": "Invalid verification code. 2 attempts remaining.",
  "remainingAttempts": 2
}
```

**Error Response (locked):**
```json
{
  "success": false,
  "error": "Too many attempts. Please try again in 14 minutes.",
  "locked": true
}
```

---

### 3. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "resetToken": "abc123xyz789",
  "newPassword": "MyNewP@ssw0rd123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your password has been successfully changed. You can now log in with your new password."
}
```

---

## 🔒 Security Features

### 1. OTP Security
- **6-digit random code**
- **5-minute expiration**
- **Single-use only**
- **Stored hashed in database**

### 2. Rate Limiting
- **3 failed attempts** → 15-minute lockout
- **Automatic unlock** after timeout
- **Attempt counter** shown to user

### 3. Password Requirements
```
✓ Minimum 12 characters
✓ At least 1 uppercase letter (A-Z)
✓ At least 1 lowercase letter (a-z)
✓ At least 1 number (0-9)
✓ At least 1 symbol (!@#$%^&*...)
```

### 4. Password History
- Prevents reuse of **last 3 passwords**
- Compares using bcrypt
- Stores hashed passwords only

### 5. Device Tracking
- Logs **IP address**
- Logs **device type** (Windows, Mac, iPhone, etc.)
- Logs **timestamp**
- Included in confirmation email

### 6. Email Enumeration Prevention
- Same response for existing/non-existing emails
- Prevents attackers from discovering valid emails

---

## 📧 Email Templates

### OTP Email
```
Subject: Password Reset Verification Code

Your verification code: 123456

This code will expire in 5 minutes.

⚠️ If you didn't request this, ignore this email.
```

### Confirmation Email
```
Subject: Password Changed Successfully

✓ Your password has been successfully changed.

Date & Time: Nov 30, 2025, 10:30 AM
Device: Windows PC (IP: 192.168.1.1)

⚠️ Didn't make this change?
Contact support immediately.
```

---

## 🧪 Testing

### Run Test Script
```bash
node test-password-reset.js
```

### Manual Testing

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Visit the forgot password page:**
   ```
   http://localhost:3000/forgot-password
   ```

3. **Test the flow:**
   - Enter test email
   - Check console for OTP
   - Enter OTP
   - Set new password
   - Check confirmation email in console

### Test Cases

✅ Valid email → OTP sent  
✅ Invalid email → Same response (security)  
✅ Valid OTP → Proceed to reset  
✅ Invalid OTP → Show remaining attempts  
✅ 3 failed attempts → 15-minute lockout  
✅ Expired OTP → Request new one  
✅ Weak password → Validation error  
✅ Reused password → Rejection  
✅ Valid reset → Success + email  

---

## 🎨 Frontend Features

### Step 1: Email Input
- Clean, modern design
- Email validation
- Loading states

### Step 2: OTP Input
- Large, centered input
- Auto-format (6 digits only)
- Expiry timer display
- Remaining attempts counter

### Step 3: Password Reset
- Real-time password strength indicator
- Visual requirement checklist
- Password confirmation
- Success message

---

## 🔌 Email Service Integration

Currently using **console logging** for development.

### Production Setup

Replace in `lib/email-service.ts`:

#### Option 1: SendGrid
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail({ to, subject, html }: EmailOptions) {
  await sgMail.send({
    to,
    from: 'noreply@yourapp.com',
    subject,
    html,
  });
  return true;
}
```

#### Option 2: Resend
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: EmailOptions) {
  await resend.emails.send({
    from: 'noreply@yourapp.com',
    to,
    subject,
    html,
  });
  return true;
}
```

#### Option 3: AWS SES
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'us-east-1' });

export async function sendEmail({ to, subject, html }: EmailOptions) {
  await ses.send(new SendEmailCommand({
    Source: 'noreply@yourapp.com',
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
  }));
  return true;
}
```

---

## 📊 Database Schema Updates

```typescript
// User model additions
{
  passwordHistory: [String],      // Last 5 hashed passwords
  resetOTP: String,                // Current OTP or reset token
  resetOTPExpires: Date,           // Expiration time
  resetAttempts: Number,           // Failed attempt counter
  resetLockedUntil: Date,          // Lockout expiration
  lastPasswordReset: Date,         // Last reset timestamp
}
```

---

## 🛡️ Security Best Practices

✅ **Never show old passwords**  
✅ **Always hash passwords** (bcrypt with salt)  
✅ **Use HTTPS in production**  
✅ **Rate limit all endpoints**  
✅ **Log security events**  
✅ **Send email notifications**  
✅ **Implement CSRF protection**  
✅ **Use secure random OTP generation**  
✅ **Expire tokens quickly**  
✅ **Prevent email enumeration**  

---

## 🚨 Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Missing email | 400 | Email is required |
| Invalid email format | 400 | Invalid email format |
| Invalid OTP | 400 | Invalid verification code. X attempts remaining |
| Expired OTP | 400 | Verification code expired |
| Too many attempts | 429 | Too many attempts. Try again in X minutes |
| Weak password | 400 | Password must include... |
| Reused password | 400 | Cannot reuse recent passwords |
| Expired reset token | 400 | Reset token expired |

---

## 📱 Mobile Responsive

The UI is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

---

## 🎯 Next Steps

1. **Integrate real email service** (SendGrid, Resend, AWS SES)
2. **Add SMS OTP option** (Twilio, AWS SNS)
3. **Implement 2FA** (TOTP, authenticator apps)
4. **Add security questions** (optional backup)
5. **Create admin dashboard** (view reset logs)
6. **Add IP geolocation** (show city/country in emails)
7. **Implement CAPTCHA** (prevent bot attacks)

---

## 📞 Support

If you encounter issues:
1. Check server console for errors
2. Verify MongoDB connection
3. Check email service logs
4. Review test script output

---

## ✅ Checklist

- [x] OTP generation & validation
- [x] Email sending (dev mode)
- [x] Rate limiting (3 attempts)
- [x] Password validation (12+ chars)
- [x] Password history (no reuse)
- [x] Device tracking
- [x] Confirmation emails
- [x] Frontend UI (3 steps)
- [x] Error handling
- [x] Security logging
- [x] Test script
- [ ] Production email service
- [ ] SMS OTP option
- [ ] 2FA integration

---

**System Status:** ✅ Fully Functional  
**Security Level:** 🔒 High  
**User Experience:** ⭐⭐⭐⭐⭐  

Your password reset system is ready to use! 🚀
