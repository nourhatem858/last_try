@echo off
echo ========================================
echo Data Consistency Fix - Verification
echo ========================================
echo.

echo [1/5] Checking upload directory...
if exist "public\uploads" (
    echo ✓ Upload directory exists
) else (
    echo ✗ Upload directory missing
    echo Creating directory...
    mkdir public\uploads
    echo ✓ Created public\uploads
)
echo.

echo [2/5] Checking environment configuration...
if exist ".env.local" (
    echo ✓ .env.local exists
    findstr /C:"MONGODB_URI" .env.local >nul
    if errorlevel 1 (
        echo ✗ MONGODB_URI not configured
    ) else (
        echo ✓ MONGODB_URI configured
    )
    findstr /C:"JWT_SECRET" .env.local >nul
    if errorlevel 1 (
        echo ✗ JWT_SECRET not configured
    ) else (
        echo ✓ JWT_SECRET configured
    )
) else (
    echo ✗ .env.local not found
)
echo.

echo [3/5] Checking MongoDB connection...
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge-workspace').then(() => { console.log('✓ MongoDB connected'); process.exit(0); }).catch(err => { console.error('✗ MongoDB connection failed:', err.message); process.exit(1); });"
if errorlevel 1 (
    echo.
    echo WARNING: MongoDB connection failed!
    echo Please ensure MongoDB is running.
    echo.
)
echo.

echo [4/5] Checking required files...
set FILES_OK=1

if exist "lib\search-service.ts" (
    echo ✓ lib\search-service.ts
) else (
    echo ✗ lib\search-service.ts missing
    set FILES_OK=0
)

if exist "lib\file-upload.ts" (
    echo ✓ lib\file-upload.ts
) else (
    echo ✗ lib\file-upload.ts missing
    set FILES_OK=0
)

if exist "lib\document-processor.ts" (
    echo ✓ lib\document-processor.ts
) else (
    echo ✗ lib\document-processor.ts missing
    set FILES_OK=0
)

if exist "app\api\dashboard\summary\route.ts" (
    echo ✓ app\api\dashboard\summary\route.ts
) else (
    echo ✗ app\api\dashboard\summary\route.ts missing
    set FILES_OK=0
)

if exist "app\api\documents\route.ts" (
    echo ✓ app\api\documents\route.ts
) else (
    echo ✗ app\api\documents\route.ts missing
    set FILES_OK=0
)

if exist "app\api\notes\route.ts" (
    echo ✓ app\api\notes\route.ts
) else (
    echo ✗ app\api\notes\route.ts missing
    set FILES_OK=0
)

if exist "app\api\chats\route.ts" (
    echo ✓ app\api\chats\route.ts
) else (
    echo ✗ app\api\chats\route.ts missing
    set FILES_OK=0
)

if exist "app\api\search\route.ts" (
    echo ✓ app\api\search\route.ts
) else (
    echo ✗ app\api\search\route.ts missing
    set FILES_OK=0
)

if exist "test-data-consistency.js" (
    echo ✓ test-data-consistency.js
) else (
    echo ✗ test-data-consistency.js missing
    set FILES_OK=0
)
echo.

echo [5/5] Summary
echo ========================================
if %FILES_OK%==1 (
    echo ✓ All required files present
) else (
    echo ✗ Some files are missing
)
echo.

echo ========================================
echo Next Steps:
echo ========================================
echo 1. Start the server:
echo    npm run dev
echo.
echo 2. Run the test suite (in another terminal):
echo    node test-data-consistency.js
echo.
echo 3. If tests fail, check:
echo    - MongoDB is running
echo    - Server is running on port 3000
echo    - .env.local is configured correctly
echo.
echo ========================================
pause
