@echo off
cls
echo ========================================
echo AI Knowledge Workspace - Dev Server
echo ========================================
echo.

echo Running system verification...
node verify-system.js
echo.

echo ========================================
echo Starting development server...
echo ========================================
echo.
echo Visit: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev
