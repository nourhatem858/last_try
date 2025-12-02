#!/bin/bash

# Signup Feature Setup Script
# Run this to set up everything automatically

echo "🚀 Setting up Signup Feature..."
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install bcryptjs jsonwebtoken mongoose axios
npm install -D @types/bcryptjs @types/jsonwebtoken

# Step 2: Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local..."
    
    # Generate JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    cat > .env.local << EOF
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace

# JWT Secret
JWT_SECRET=$JWT_SECRET

# API URL (leave empty for Next.js API routes)
NEXT_PUBLIC_API_URL=
EOF
    
    echo "✅ .env.local created"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start MongoDB: mongod"
echo "2. Start Next.js: npm run dev"
echo "3. Visit: http://localhost:3000/signup"
echo ""
echo "💡 Or use MongoDB Atlas (free):"
echo "   https://www.mongodb.com/cloud/atlas"
echo ""
