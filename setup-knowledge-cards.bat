@echo off
echo.
echo ========================================
echo   Knowledge Cards System Setup
echo ========================================
echo.

echo [1/2] Installing dependencies...
call npm install

echo.
echo [2/2] Setup complete!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Make sure MongoDB is running:
echo    mongod
echo.
echo 2. Make sure .env.local exists with:
echo    MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace
echo    JWT_SECRET=your-secret-key
echo.
echo 3. Start the development server:
echo    npm run dev
echo.
echo 4. Visit the Knowledge Cards:
echo    http://localhost:3000/cards
echo.
echo ========================================
echo   Features Available:
echo ========================================
echo.
echo - View all knowledge cards
echo - Create new cards
echo - Edit your cards
echo - Delete your cards
echo - Like cards
echo - Bookmark cards
echo - Search cards
echo - Filter by category
echo - Tag management
echo.
echo Ready to go! 🎉
echo.
pause
