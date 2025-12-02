@echo off
echo ========================================
echo Authentication System Test
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
echo Starting authentication tests...
echo.

node test-auth-complete-fixed.js

echo.
echo ========================================
echo Test Complete
echo ========================================
echo.
pause
