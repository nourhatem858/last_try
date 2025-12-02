# Forgot Password - Quick Start

## 🚀 Quick Test

```bash
# 1. Start server
npm run dev

# 2. Visit
http://localhost:3000/forgot-password

# 3. Enter email
test@example.com

# 4. Check console for OTP
# Look for: "📧 Email sent to: test@example.com"
# Copy the 6-digit code

# 5. Enter OTP and set new password

# 6. Login with new password
http://localhost:3000/login
```

## 📋 3-Step Flow

### Step 1: Email
- Enter your email
- Click "Send Verification Code"
- Check email (or console in dev)

### Step 2: OTP
- Enter 6-digit code
- Click "Verify Code"
- Max 3 attempts

### Step 3: Password
- Enter new password (12+ chars)
- Confirm password
- Click "Reset Password"
- Auto-redirects to login

## 🔐 Password Requirements

- ✓ At least 12 characters
- ✓ Uppercase letter (A-Z)
- ✓ Lowercase letter (a-z)
- ✓ Number (0-9)
- ✓ Symbol (!@#$%...)

## 🎨 Features

- Dark theme (matches login)
- Real-time password validation
- Loading states
- Clear error messages
- Success confirmations
- Auto-redirect

## 🧪 Test Scenarios

### Happy Path
```
1. Enter: test@example.com
2. Get OTP from console
3. Enter OTP: 123456
4. New password: MyNewPass123!
5. Confirm: MyNewPass123!
6. Success! → Login
```

### Error Cases
```
# Invalid OTP
- Enter wrong code
- See: "Invalid code. 2 attempts remaining"

# Expired OTP
- Wait 5+ minutes
- See: "Code expired. Request new one"

# Weak Password
- Enter: "password"
- See: Requirements not met (red)

# Password Reuse
- Use old password
- See: "Cannot reuse recent passwords"
```

## 🔧 Development

### Check OTP in Console
```bash
# Server console shows:
📧 Email sent to: test@example.com
Subject: Password Reset Verification Code
Content: [HTML with OTP: 123456]
```

### API Endpoints
```
POST /api/auth/forgot-password  # Request OTP
POST /api/auth/verify-otp       # Verify OTP
POST /api/auth/reset-password   # Reset password
```

## 🚀 Production Setup

### Add Email Service

**Option 1: SendGrid**
```bash
npm install @sendgrid/mail
```

```typescript
// lib/email-service.ts
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
await sgMail.send({ to, from, subject, html });
```

**Option 2: Resend**
```bash
npm install resend
```

```typescript
// lib/email-service.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({ from, to, subject, html });
```

### Environment Variables
```env
# .env.local
SENDGRID_API_KEY=your-key
# or
RESEND_API_KEY=your-key
```

## ✅ Verification

- [ ] Visit `/forgot-password`
- [ ] Enter email → Success message
- [ ] Check console for OTP
- [ ] Enter OTP → Verification success
- [ ] Set new password → Success
- [ ] Redirect to login works
- [ ] Login with new password works

## 🐛 Troubleshooting

### Issue: "An error occurred"
**Solution:**
1. Check MongoDB is running
2. Check server console for errors
3. Verify email format is valid

### Issue: OTP not received
**Solution:**
1. Check server console (dev mode)
2. Verify email service configured (production)
3. Check spam folder (production)

### Issue: "Invalid code"
**Solution:**
1. Check OTP from console/email
2. Verify not expired (5 minutes)
3. Check remaining attempts

### Issue: Password rejected
**Solution:**
1. Check all requirements met
2. Verify not reusing old password
3. Ensure passwords match

## 📊 Status

**✅ WORKING**

All features implemented and tested:
- Email validation ✓
- OTP generation ✓
- OTP verification ✓
- Password reset ✓
- Security features ✓
- Dark theme ✓
- Error handling ✓

---

For complete details, see: `FORGOT_PASSWORD_COMPLETE.md`
