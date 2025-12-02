@echo off
REM Signup Feature Setup Script for Windows
REM Run this to set up everything automatically

echo 🚀 Setting up Signup Feature...
echo.

REM Step 1: Install dependencies
echo 📦 Installing dependencies...
call npm install bcryptjs jsonwebtoken mongoose axios
call npm install -D @types/bcryptjs @types/jsonwebtoken

REM Step 2: Create .env.local if it doesn't exist
if not exist .env.local (
    echo.
    echo 📝 Creating .env.local...
    
    REM Generate JWT secret
    for /f %%i in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set JWT_SECRET=%%i
    
    (
        echo # MongoDB Connection
        echo MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace
        echo.
        echo # JWT Secret
        echo JWT_SECRET=%JWT_SECRET%
        echo.
        echo # API URL ^(leave empty for Next.js API routes^)
        echo NEXT_PUBLIC_API_URL=
    ) > .env.local
    
    echo ✅ .env.local created
) else (
    echo ✅ .env.local already exists
)

echo.
echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Start MongoDB: mongod
echo 2. Start Next.js: npm run dev
echo 3. Visit: http://localhost:3000/signup
echo.
echo 💡 Or use MongoDB Atlas ^(free^):
echo    https://www.mongodb.com/cloud/atlas
echo.
pause
