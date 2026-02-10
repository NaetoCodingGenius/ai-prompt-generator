@echo off
echo ============================================
echo Testing Build...
echo ============================================
echo.

call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed! Check errors above.
    pause
    exit /b 1
) else (
    echo.
    echo ✓ Build successful! All TypeScript errors fixed.
    echo.
    pause
)
