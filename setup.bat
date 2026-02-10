@echo off
echo ============================================
echo AI Study Assistant - Setup Script
echo ============================================
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo ✓ Dependencies installed!
echo.

echo Step 2: Checking for build errors...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Build has errors! Check the messages above.
    echo Press any key to continue anyway, or close this window to stop.
    pause
) else (
    echo ✓ Build successful!
)
echo.

echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Make sure .env.local has your ANTHROPIC_API_KEY
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
pause
