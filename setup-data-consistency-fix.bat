@echo off
echo ========================================
echo Data Consistency Fix - Setup Script
echo ========================================
echo.

echo [1/4] Creating upload directory...
if not exist "public\uploads" (
    mkdir public\uploads
    echo ✓ Created public\uploads
) else (
    echo ✓ Upload directory already exists
)
echo.

echo [2/4] Checking MongoDB connection...
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge-workspace').then(() => { console.log('✓ MongoDB connected'); process.exit(0); }).catch(err => { console.error('✗ MongoDB connection failed:', err.message); process.exit(1); });"
if errorlevel 1 (
    echo.
    echo WARNING: MongoDB connection failed!
    echo Please ensure MongoDB is running and MONGODB_URI is set in .env.local
    echo.
)
echo.

echo [3/4] Checking environment variables...
if exist ".env.local" (
    echo ✓ .env.local file exists
    findstr /C:"MONGODB_URI" .env.local >nul
    if errorlevel 1 (
        echo ✗ MONGODB_URI not found in .env.local
    ) else (
        echo ✓ MONGODB_URI configured
    )
    findstr /C:"JWT_SECRET" .env.local >nul
    if errorlevel 1 (
        echo ✗ JWT_SECRET not found in .env.local
    ) else (
        echo ✓ JWT_SECRET configured
    )
) else (
    echo ✗ .env.local file not found
    echo Creating from example...
    if exist ".env.local.example" (
        copy .env.local.example .env.local
        echo ✓ Created .env.local from example
        echo Please update MONGODB_URI and JWT_SECRET in .env.local
    )
)
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Start the development server:
echo    npm run dev
echo.
echo 2. Run the test suite (in another terminal):
echo    node test-data-consistency.js
echo.
echo 3. Review the guide:
echo    DATA_CONSISTENCY_FIX_GUIDE.md
echo.
echo ========================================
pause
