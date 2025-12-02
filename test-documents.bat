@echo off
echo ========================================
echo Document Functionality Test
echo ========================================
echo.

echo Installing required dependencies...
call npm install formdata-node
echo.

echo Starting test suite...
echo.
node test-document-functionality.js

echo.
echo ========================================
echo Test Complete
echo ========================================
pause
