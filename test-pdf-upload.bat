@echo off
echo ========================================
echo PDF Upload System - Quick Test
echo ========================================
echo.

echo Checking pdf-parse installation...
call npm ls pdf-parse
echo.

echo ========================================
echo Test Instructions:
echo ========================================
echo.
echo 1. Start dev server:
echo    npm run dev
echo.
echo 2. Visit test page:
echo    http://localhost:3000/test-pdf
echo.
echo 3. Upload a PDF file
echo.
echo 4. Verify text extraction works
echo.
echo ========================================
echo Documentation:
echo ========================================
echo.
echo - PDF_UPLOAD_READY.md     - Start here
echo - PDF_QUICK_FIX.md         - Quick reference
echo - PDF_UPLOAD_SOLUTION.md  - Complete guide
echo - COMPLETE_PDF_EXAMPLE.md - Code examples
echo.
echo ========================================
echo.

pause
