# 🔧 Environment Variables Setup Guide

## ✅ `.env.local` File Created

I've created a `.env.local` file in your project root with all necessary environment variables.

## 📋 Required Steps

### 1. MongoDB Atlas Setup

#### Option A: MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com
   - Sign up for a free account
   - Create a new cluster (free tier available)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

3. **Create Database User**
   - Go to "Database Access" in Atlas
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
   - Grant "Read and write to any database" role

4. **Whitelist IP Address**
   - Go to "Network Access" in Atlas
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP addresses

5. **Update `.env.local`**
   ```env
   MONGODB_URI=mongodb+srv://myusername:mypassword@cluster0.xxxxx.mongodb.net/ai-knowledge-workspace?retryWrites=true&w=majority
   ```
   
   Replace:
   - `myusername` → Your database username
   - `mypassword` → Your database password (URL encode special characters!)
   - `cluster0.xxxxx` → Your cluster address
   - `ai-knowledge-workspace` → Your database name

#### Option B: Local MongoDB (For Development)

1. **Install MongoDB**
   ```bash
   # Windows (with Chocolatey)
   choco install mongodb
   
   # macOS (with Homebrew)
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install mongodb
   ```

2. **Start MongoDB**
   ```bash
   # Windows
   mongod
   
   # macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   ```

3. **Update `.env.local`**
   ```env
   MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace
   ```

### 2. JWT Secret Setup

#### Generate Secure JWT Secret

**Option 1: Using Node.js (Recommended)**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

This generates a 128-character random hex string like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0
```

**Option 2: Using OpenSSL**
```bash
openssl rand -hex 64
```

**Option 3: Using Online Generator**
- Visit: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" (256-bit)

#### Update `.env.local`
```env
JWT_SECRET=your-generated-secret-here
```

**⚠️ IMPORTANT:**
- Use a different secret for production
- Never commit the actual secret to Git
- Minimum 32 characters recommended
- Use random, unpredictable characters

### 3. Verify Configuration

#### Check `.env.local` File

Your `.env.local` should look like this:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://john:MyP@ssw0rd@cluster0.abc123.mongodb.net/ai-knowledge-workspace?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# API URL (empty for Next.js API routes)
NEXT_PUBLIC_API_URL=

# Environment
NODE_ENV=development
```

#### Test Connection

1. **Restart Next.js Dev Server**
   ```bash
   # Stop current server (Ctrl+C)
   # Start again
   npm run dev
   ```

2. **Test Signup API**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

3. **Expected Response**
   ```json
   {
     "success": true,
     "message": "Account created successfully",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "...",
       "name": "Test User",
       "email": "test@example.com",
       "role": "user"
     }
   }
   ```

## 🔒 Security Best Practices

### For Development

```env
# .env.local (local development)
MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace
JWT_SECRET=dev-secret-key-not-for-production
NODE_ENV=development
```

### For Production

```env
# .env.production (production environment)
MONGODB_URI=mongodb+srv://prod-user:SecureP@ss123@cluster0.xxxxx.mongodb.net/production?retryWrites=true&w=majority
JWT_SECRET=super-secure-random-64-character-secret-generated-with-crypto
NODE_ENV=production
```

### Important Security Notes

1. **Never commit `.env.local` to Git**
   - Already in `.gitignore`
   - Use `.env.local.example` for templates

2. **URL Encode Special Characters in MongoDB Password**
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`
   - `&` → `%26`
   
   Example:
   ```
   Password: MyP@ss#123
   Encoded:  MyP%40ss%23123
   ```

3. **Use Different Secrets for Different Environments**
   - Development: Simple secret for testing
   - Production: Strong, random secret

4. **Rotate Secrets Regularly**
   - Change JWT secret every 3-6 months
   - Update MongoDB password periodically

## 🐛 Troubleshooting

### Error: "Please define the MONGODB_URI environment variable"

**Solution:**
1. Make sure `.env.local` exists in project root
2. Restart Next.js dev server
3. Check file is named exactly `.env.local` (not `.env.local.txt`)

### Error: "MongoServerError: bad auth"

**Solution:**
1. Check username and password are correct
2. URL encode special characters in password
3. Verify database user has correct permissions in Atlas

### Error: "MongooseServerSelectionError: connect ECONNREFUSED"

**Solution:**
1. Check MongoDB is running (for local)
2. Check IP whitelist in Atlas (for cloud)
3. Verify connection string format

### Error: "Invalid JWT token"

**Solution:**
1. Check JWT_SECRET is set in `.env.local`
2. Restart server after changing JWT_SECRET
3. Clear browser localStorage and try again

### Error: "Source map warnings"

**Solution:**
These are warnings, not errors. To suppress:
```javascript
// next.config.ts
const nextConfig = {
  productionBrowserSourceMaps: false,
  webpack: (config) => {
    config.devtool = false;
    return config;
  },
};
```

## 📝 Quick Reference

### MongoDB URI Formats

**Atlas (Cloud):**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Local:**
```
mongodb://localhost:27017/<database>
```

**With Authentication (Local):**
```
mongodb://<username>:<password>@localhost:27017/<database>?authSource=admin
```

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | ✅ Yes | Secret for JWT signing | `a1b2c3d4...` |
| `NEXT_PUBLIC_API_URL` | ❌ No | External API URL | `http://localhost:5000/api` |
| `NODE_ENV` | ❌ No | Environment mode | `development` |

### Generate JWT Secret Commands

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64

# PowerShell (Windows)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

## ✅ Checklist

Before testing your signup:

- [ ] `.env.local` file created in project root
- [ ] `MONGODB_URI` set with valid connection string
- [ ] `JWT_SECRET` set with secure random string
- [ ] MongoDB Atlas cluster created (or local MongoDB running)
- [ ] Database user created with correct permissions
- [ ] IP address whitelisted in Atlas (if using cloud)
- [ ] Next.js dev server restarted
- [ ] Test signup API endpoint

## 🎯 Next Steps

1. **Update `.env.local`** with your actual credentials
2. **Restart dev server**: `npm run dev`
3. **Test signup**: Visit `http://localhost:3000/signup`
4. **Verify in MongoDB**: Check if user was created

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [MongoDB Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)

---

**Need help?** Check the troubleshooting section above or run the test script:
```bash
node test-signup-complete.js
```
