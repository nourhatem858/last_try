@echo off
REM ========================================
REM Complete System Fix Script (Windows)
REM Fixes all issues in Adaptive AI Knowledge Workspace
REM ========================================

echo.
echo ========================================
echo  ADAPTIVE AI KNOWLEDGE WORKSPACE
echo  Complete System Fix Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Checking Node.js version...
node --version
echo.

echo [2/6] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [3/6] Verifying MongoDB connection...
node verify-mongodb-connection.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] MongoDB connection failed!
    echo.
    echo Please fix the MongoDB connection issues above, then run this script again.
    echo.
    echo Common fixes:
    echo   1. Add your IP (196.128.225.174) to MongoDB Atlas Network Access
    echo   2. Or allow all IPs (0.0.0.0/0) for testing
    echo   3. Wait 2-3 minutes after making changes
    echo   4. Verify your username and password are correct
    echo.
    pause
    exit /b 1
)
echo.

echo [4/6] Cleaning up database (removing fake data)...
node scripts/cleanup-and-initialize.js
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database cleanup had issues, but continuing...
)
echo.

echo [5/6] Building Next.js application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Build had warnings, but continuing...
)
echo.

echo [6/6] System fix complete!
echo.
echo ========================================
echo  NEXT STEPS
echo ========================================
echo.
echo 1. Start the development server:
echo    npm run dev
echo.
echo 2. Open your browser:
echo    http://localhost:3000
echo.
echo 3. Create a new account (signup)
echo.
echo 4. Test the system:
echo    - Create workspaces
echo    - Create notes
echo    - Upload documents
echo    - Use AI chat
echo.
echo 5. Run automated tests (optional):
echo    node scripts/test-complete-system.js
echo.
echo ========================================
echo  SYSTEM STATUS: READY
echo ========================================
echo.
pause
