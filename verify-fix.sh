#!/bin/bash

echo "========================================"
echo "Data Consistency Fix - Verification"
echo "========================================"
echo ""

echo "[1/5] Checking upload directory..."
if [ -d "public/uploads" ]; then
    echo "✓ Upload directory exists"
else
    echo "✗ Upload directory missing"
    echo "Creating directory..."
    mkdir -p public/uploads
    echo "✓ Created public/uploads"
fi
echo ""

echo "[2/5] Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "✓ .env.local exists"
    if grep -q "MONGODB_URI" .env.local; then
        echo "✓ MONGODB_URI configured"
    else
        echo "✗ MONGODB_URI not configured"
    fi
    if grep -q "JWT_SECRET" .env.local; then
        echo "✓ JWT_SECRET configured"
    else
        echo "✗ JWT_SECRET not configured"
    fi
else
    echo "✗ .env.local not found"
fi
echo ""

echo "[3/5] Checking MongoDB connection..."
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge-workspace').then(() => { console.log('✓ MongoDB connected'); process.exit(0); }).catch(err => { console.error('✗ MongoDB connection failed:', err.message); process.exit(1); });" 2>/dev/null
if [ $? -ne 0 ]; then
    echo ""
    echo "WARNING: MongoDB connection failed!"
    echo "Please ensure MongoDB is running."
    echo ""
fi
echo ""

echo "[4/5] Checking required files..."
FILES_OK=1

check_file() {
    if [ -f "$1" ]; then
        echo "✓ $1"
    else
        echo "✗ $1 missing"
        FILES_OK=0
    fi
}

check_file "lib/search-service.ts"
check_file "lib/file-upload.ts"
check_file "lib/document-processor.ts"
check_file "app/api/dashboard/summary/route.ts"
check_file "app/api/documents/route.ts"
check_file "app/api/notes/route.ts"
check_file "app/api/chats/route.ts"
check_file "app/api/search/route.ts"
check_file "test-data-consistency.js"
echo ""

echo "[5/5] Summary"
echo "========================================"
if [ $FILES_OK -eq 1 ]; then
    echo "✓ All required files present"
else
    echo "✗ Some files are missing"
fi
echo ""

echo "========================================"
echo "Next Steps:"
echo "========================================"
echo "1. Start the server:"
echo "   npm run dev"
echo ""
echo "2. Run the test suite (in another terminal):"
echo "   node test-data-consistency.js"
echo ""
echo "3. If tests fail, check:"
echo "   - MongoDB is running"
echo "   - Server is running on port 3000"
echo "   - .env.local is configured correctly"
echo ""
echo "========================================"
