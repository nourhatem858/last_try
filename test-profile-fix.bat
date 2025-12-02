@echo off
echo ========================================
echo Profile Access Fix - Quick Test
echo ========================================
echo.

echo Step 1: Check if server is running...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Server is not running!
    echo Please run: npm run dev
    echo.
    pause
    exit /b 1
)
echo [OK] Server is running
echo.

echo Step 2: Testing auth endpoint...
echo.
echo Please follow these steps:
echo.
echo 1. Open browser: http://localhost:3000/debug-auth
echo 2. Check if token exists
echo 3. Click "Test API" button
echo 4. If test fails:
echo    - Click "Clear Auth"
echo    - Click "Go to Login"
echo    - Login with your credentials
echo    - Go back to /debug-auth
echo    - Click "Test API" again
echo 5. If test succeeds:
echo    - Click "Go to Profile"
echo    - You should see your profile!
echo.

echo Opening debug page in browser...
start http://localhost:3000/debug-auth

echo.
echo ========================================
echo Debug page opened in browser
echo Follow the instructions above
echo ========================================
pause
