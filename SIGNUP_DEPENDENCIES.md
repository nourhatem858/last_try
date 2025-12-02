# Signup Feature - Required Dependencies

## 📦 Install Commands

### All Dependencies at Once

```bash
npm install bcryptjs jsonwebtoken mongoose
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Individual Installation

```bash
# Password hashing
npm install bcryptjs
npm install -D @types/bcryptjs

# JWT tokens
npm install jsonwebtoken
npm install -D @types/jsonwebtoken

# MongoDB
npm install mongoose
```

## 📋 Package.json Additions

Add these to your `package.json`:

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5"
  }
}
```

## 🔧 Environment Variables

Create or update `.env.local`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API URL (already exists)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🗄️ MongoDB Setup Options

### Option 1: Local MongoDB

```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community

# Start MongoDB
mongod
```

### Option 2: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## 🔐 Generate Secure JWT Secret

### Using Node.js

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Using OpenSSL

```bash
openssl rand -hex 64
```

### Using Online Generator

Visit: https://www.grc.com/passwords.htm

## ✅ Verification

After installation, verify:

```bash
# Check if packages are installed
npm list bcryptjs jsonwebtoken mongoose

# Should show:
# ├── bcryptjs@2.4.3
# ├── jsonwebtoken@9.0.2
# └── mongoose@8.0.0
```

## 🚀 Quick Test

Test the signup API:

```bash
# Start your Next.js app
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📝 Notes

- **bcryptjs** is used instead of bcrypt for better cross-platform compatibility
- **jsonwebtoken** handles JWT creation and verification
- **mongoose** provides MongoDB object modeling
- All packages are production-ready and actively maintained

## 🔄 Alternative: Without MongoDB

If you want to test without MongoDB first, the API route already has mock data. Just comment out the MongoDB parts and use the mock implementation.

## 💡 Pro Tips

1. **Never commit `.env.local`** - Add it to `.gitignore`
2. **Use strong JWT secrets** - At least 64 characters
3. **Rotate secrets regularly** - Change JWT_SECRET periodically
4. **Use MongoDB Atlas** - Free tier is perfect for development
5. **Enable MongoDB indexes** - Improves query performance

## 🐛 Common Issues

### bcrypt Installation Error

```bash
# Solution 1: Use bcryptjs (pure JavaScript)
npm uninstall bcrypt
npm install bcryptjs

# Solution 2: Rebuild
npm rebuild bcrypt
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod

# Or use MongoDB Atlas connection string
```

### JWT Secret Not Found

```bash
# Ensure .env.local exists and has JWT_SECRET
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" >> .env.local
```

## ✅ Ready to Go!

Once dependencies are installed and environment variables are set, your signup feature is ready to use!

Navigate to: `http://localhost:3000/signup`
