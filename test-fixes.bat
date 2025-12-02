@echo off
echo ========================================
echo Critical Fixes Test Suite
echo ========================================
echo.

echo Checking if server is running...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Development server is not running!
    echo Please start the server first with: npm run dev
    echo.
    pause
    exit /b 1
)

echo Server is running!
echo.
echo Starting critical fixes tests...
echo.

node test-critical-fixes.js

echo.
echo ========================================
echo Test Complete
echo ========================================
echo.
echo Next steps:
echo 1. Check test results above
echo 2. Try manual testing in browser
echo 3. Visit http://localhost:3000/signup
echo.
pause
