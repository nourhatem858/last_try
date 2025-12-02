@echo off
REM AI-Powered Knowledge Workspace - Setup Script for Windows
REM This script helps you set up the AI-powered workspace

echo ================================================================
echo    AI-POWERED KNOWLEDGE WORKSPACE - SETUP WIZARD
echo ================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm is installed
npm --version
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [INFO] Creating .env.local from example...
    copy .env.local.example .env.local
    echo [OK] .env.local created
    echo.
    echo [IMPORTANT] Please add your OpenAI API key to .env.local
    echo Get your key from: https://platform.openai.com/api-keys
    echo.
    echo Open .env.local and add:
    echo OPENAI_API_KEY=sk-your-key-here
    echo.
    pause
) else (
    echo [OK] .env.local already exists
    echo.
)

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
    echo.
) else (
    echo [OK] Dependencies already installed
    echo.
)

echo ================================================================
echo    SETUP COMPLETE!
echo ================================================================
echo.
echo Next steps:
echo.
echo 1. Add your OpenAI API key to .env.local
echo    OPENAI_API_KEY=sk-your-key-here
echo.
echo 2. Start the development server:
echo    npm run dev
echo.
echo 3. Run tests to verify everything works:
echo    node test-ai-system.js
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo Documentation:
echo - QUICK_START_AI.md - Get started in 5 minutes
echo - AI_IMPLEMENTATION_COMPLETE.md - Full setup guide
echo - TRANSFORMATION_COMPLETE_REPORT.md - Detailed report
echo.
echo ================================================================
echo.
pause
