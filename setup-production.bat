@echo off
echo ========================================
echo Knowledge Workspace - Production Setup
echo ========================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [ERROR] .env.local file not found!
    echo.
    echo Please create .env.local with the following:
    echo   MONGODB_URI=mongodb+srv://^<username^>:^<password^>@^<cluster^>.mongodb.net/^<database^>?retryWrites=true^&w=majority
    echo   JWT_SECRET=^<your-secret-key^>
    echo   OPENAI_API_KEY=sk-your-openai-api-key
    echo.
    echo Copy from .env.local.example and update with your values.
    pause
    exit /b 1
)

echo [1/5] Checking environment configuration...
node -e "require('dotenv').config({path:'.env.local'});const missing=[];['MONGODB_URI','JWT_SECRET','OPENAI_API_KEY'].forEach(v=>{if(!process.env[v]||process.env[v].includes('<')||process.env[v].includes('your-')){missing.push(v)}});if(missing.length>0){console.log('Missing or placeholder values:',missing.join(', '));process.exit(1)}else{console.log('All required variables set')}"
if errorlevel 1 (
    echo [ERROR] Environment variables not properly configured
    echo Please update .env.local with real values
    pause
    exit /b 1
)

echo.
echo [2/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [3/5] Checking MongoDB connection...
node -e "const mongoose=require('mongoose');require('dotenv').config({path:'.env.local'});mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000}).then(()=>{console.log('MongoDB connected successfully');process.exit(0)}).catch(e=>{console.error('MongoDB connection failed:',e.message);process.exit(1)})"
if errorlevel 1 (
    echo [ERROR] MongoDB connection failed
    echo.
    echo Please check:
    echo   1. MongoDB URI is correct in .env.local
    echo   2. Username and password are correct
    echo   3. IP 196.128.225.174 is whitelisted in MongoDB Atlas
    echo   4. Your cluster is running
    pause
    exit /b 1
)

echo.
echo [4/5] Building application...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo.
echo [5/5] Running production readiness tests...
node test-production-ready.js
if errorlevel 1 (
    echo.
    echo [WARNING] Some tests failed
    echo Review test-production-ready-report.json for details
    pause
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the development server:
echo   npm run dev
echo.
echo To start the production server:
echo   npm start
echo.
pause
