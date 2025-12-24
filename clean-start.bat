@echo off
REM Clean Start Script - Use this to start dev server cleanly
REM Prevents lock and process issues

echo ========================================
echo Clean Start - Next.js Dev Server
echo ========================================
echo.

echo [1/3] Stopping any running node processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node processes stopped
    timeout /t 2 /nobreak >nul
) else (
    echo ✓ No node processes running
)

echo.
echo [2/3] Cleaning .next directory...
if exist .next (
    rmdir /s /q .next
    echo ✓ .next directory removed
) else (
    echo ✓ .next directory already clean
)

echo.
echo [3/3] Starting dev server...
echo ========================================
echo.
npm run dev
