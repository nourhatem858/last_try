@echo off
echo ========================================
echo TypeScript Build Test
echo ========================================
echo.

echo Step 1: Checking TypeScript configuration...
if exist tsconfig.json (
    echo ✅ tsconfig.json found
) else (
    echo ❌ tsconfig.json not found
    exit /b 1
)
echo.

echo Step 2: Running TypeScript type check...
echo Running: npx tsc --noEmit
call npx tsc --noEmit
if %errorlevel% neq 0 (
    echo.
    echo ❌ TypeScript errors found!
    echo Please fix the errors above and try again.
    exit /b 1
)
echo ✅ No TypeScript errors found
echo.

echo Step 3: Building Next.js project...
echo Running: npm run build
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed!
    echo Check the errors above.
    exit /b 1
)
echo ✅ Build successful
echo.

echo ========================================
echo ✅ All checks passed!
echo ========================================
echo.
echo Your project is ready for deployment.
echo.
pause
