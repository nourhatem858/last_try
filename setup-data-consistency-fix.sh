#!/bin/bash

echo "========================================"
echo "Data Consistency Fix - Setup Script"
echo "========================================"
echo ""

echo "[1/4] Creating upload directory..."
if [ ! -d "public/uploads" ]; then
    mkdir -p public/uploads
    echo "✓ Created public/uploads"
else
    echo "✓ Upload directory already exists"
fi
echo ""

echo "[2/4] Checking MongoDB connection..."
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge-workspace').then(() => { console.log('✓ MongoDB connected'); process.exit(0); }).catch(err => { console.error('✗ MongoDB connection failed:', err.message); process.exit(1); });" 2>/dev/null
if [ $? -ne 0 ]; then
    echo ""
    echo "WARNING: MongoDB connection failed!"
    echo "Please ensure MongoDB is running and MONGODB_URI is set in .env.local"
    echo ""
fi
echo ""

echo "[3/4] Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "✓ .env.local file exists"
    if grep -q "MONGODB_URI" .env.local; then
        echo "✓ MONGODB_URI configured"
    else
        echo "✗ MONGODB_URI not found in .env.local"
    fi
    if grep -q "JWT_SECRET" .env.local; then
        echo "✓ JWT_SECRET configured"
    else
        echo "✗ JWT_SECRET not found in .env.local"
    fi
else
    echo "✗ .env.local file not found"
    if [ -f ".env.local.example" ]; then
        echo "Creating from example..."
        cp .env.local.example .env.local
        echo "✓ Created .env.local from example"
        echo "Please update MONGODB_URI and JWT_SECRET in .env.local"
    fi
fi
echo ""

echo "[4/4] Setup complete!"
echo ""
echo "========================================"
echo "Next Steps:"
echo "========================================"
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Run the test suite (in another terminal):"
echo "   node test-data-consistency.js"
echo ""
echo "3. Review the guide:"
echo "   DATA_CONSISTENCY_FIX_GUIDE.md"
echo ""
echo "========================================"
