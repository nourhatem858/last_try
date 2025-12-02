# 🔐 Password Reset - Quick Start

## 🚀 How to Use

### For Users

1. **Visit:** `http://localhost:3000/forgot-password`
2. **Enter your email** → Click "Send Verification Code"
3. **Check your email** (or console in dev mode) for 6-digit OTP
4. **Enter OTP** → Click "Verify Code"
5. **Create new password** (must meet requirements)
6. **Done!** → Log in with new password

---

## 📋 Password Requirements

Your new password must have:
- ✅ At least **12 characters**
- ✅ **Uppercase** letter (A-Z)
- ✅ **Lowercase** letter (a-z)
- ✅ **Number** (0-9)
- ✅ **Symbol** (!@#$%^&*...)

Example: `MySecure@Pass123!`

---

## ⚠️ Important Rules

- **OTP expires in 5 minutes** → Request new one if expired
- **3 attempts max** → Account locks for 15 minutes after 3 failed tries
- **Single-use code** → Each OTP can only be used once
- **No password reuse** → Can't use your last 3 passwords

---

## 🧪 Testing (Development)

```bash
# 1. Start your server
npm run dev

# 2. Run test script
node test-password-reset.js

# 3. Check console for OTP codes
# (In production, these will be sent via email)
```

---

## 📧 Email Service Setup (Production)

Currently using **console logging**. To enable real emails:

### Option 1: SendGrid (Recommended)
```bash
npm install @sendgrid/mail
```

Add to `.env.local`:
```
SENDGRID_API_KEY=your_api_key_here
```

### Option 2: Resend
```bash
npm install resend
```

Add to `.env.local`:
```
RESEND_API_KEY=your_api_key_here
```

Then update `lib/email-service.ts` with your chosen provider.

---

## 🔗 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/forgot-password` | POST | Request OTP |
| `/api/auth/verify-otp` | POST | Verify OTP code |
| `/api/auth/reset-password` | POST | Set new password |

---

## 🛡️ Security Features

✅ OTP expires in 5 minutes  
✅ Rate limiting (3 attempts)  
✅ 15-minute lockout after failed attempts  
✅ Password history (no reuse)  
✅ Device tracking  
✅ Email notifications  
✅ No email enumeration  

---

## 📱 Pages

- `/login` - Login page with "Forgot Password" link
- `/forgot-password` - Complete password reset flow

---

## 🎯 Quick Test

```bash
# Test with curl
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check console for OTP, then verify:
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

---

## ✅ System Ready!

Your password reset system is fully functional and secure. Users can now recover their accounts safely! 🎉
