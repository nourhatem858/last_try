@echo off
echo ========================================
echo   Testing Create Note and Document
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Running test script...
echo.
node test-create-note-document.js

echo.
echo ========================================
echo   Test Complete
echo ========================================
pause
