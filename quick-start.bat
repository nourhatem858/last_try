@echo off
cls
echo ========================================
echo   Knowledge Workspace - Quick Start
echo ========================================
echo.
echo Current Status:
echo   [OK] MongoDB URI configured
echo   [OK] JWT Secret configured
echo   [!!] IP Whitelist needed in MongoDB Atlas
echo   [--] OpenAI API key optional
echo.
echo ========================================
echo.

echo [Step 1] Testing MongoDB connection...
echo.
node -e "const mongoose = require('mongoose'); require('dotenv').config({path: '.env.local'}); mongoose.connect(process.env.MONGODB_URI, {serverSelectionTimeoutMS: 10000}).then(() => {console.log('SUCCESS: MongoDB connected'); process.exit(0);}).catch(e => {console.log('FAILED: ' + e.message); console.log(''); console.log('ACTION REQUIRED:'); console.log('1. Go to: https://cloud.mongodb.com/'); console.log('2. Navigate to: Security - Network Access'); console.log('3. Click: Add IP Address'); console.log('4. Add: 196.128.225.174'); console.log('5. Or: Allow Access from Anywhere (0.0.0.0/0)'); console.log('6. Wait 1-2 minutes and try again'); process.exit(1);})"

if errorlevel 1 (
    echo.
    echo ========================================
    echo   Setup Required
    echo ========================================
    echo.
    echo Please whitelist your IP in MongoDB Atlas
    echo Then run this script again.
    echo.
    echo See SETUP_INSTRUCTIONS.md for details.
    echo.
    pause
    exit /b 1
)

echo.
echo [Step 2] Starting development server...
echo.
echo Server will start on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

npm run dev
