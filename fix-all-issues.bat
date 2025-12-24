@echo off
echo ========================================
echo Fixing All Next.js Project Issues
echo ========================================
echo.

echo [1/4] Killing all Node processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node processes terminated
) else (
    echo ✓ No node processes found
)
timeout /t 2 /nobreak >nul

echo.
echo [2/4] Removing .next directory...
if exist .next (
    rmdir /s /q .next
    echo ✓ .next directory removed
) else (
    echo ✓ .next directory doesn't exist
)

echo.
echo [3/4] Updating baseline-browser-mapping...
call npm install baseline-browser-mapping@latest -D
if %errorlevel% equ 0 (
    echo ✓ baseline-browser-mapping updated
) else (
    echo ✗ Failed to update baseline-browser-mapping
)

echo.
echo [4/4] Verifying OpenAI API key...
node -e "const fs=require('fs');const env=fs.readFileSync('.env.local','utf8');const key=env.match(/OPENAI_API_KEY=(.+)/)?.[1];console.log(key&&key.startsWith('sk-')&&key.length>20?'✓ OpenAI API key looks valid':'✗ OpenAI API key missing or invalid');"

echo.
echo ========================================
echo All fixes applied!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Test OpenAI: node test-openai-connection.js
echo.
pause
