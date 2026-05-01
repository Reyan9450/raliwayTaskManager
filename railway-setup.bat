@echo off
REM Quick Railway Deployment Setup Script for Windows
REM Usage: railway-setup.bat

echo.
echo 🚀 Railway Deployment Setup Script
echo ====================================
echo.

REM Check if railway CLI is installed
where railway >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Railway CLI not found. Installing...
    call npm install -g @railway/cli
)

echo ✅ Railway CLI is installed
echo.

REM Validate configuration
echo 🔍 Validating deployment configuration...
if exist validate-railway.js (
    call node validate-railway.js
) else (
    echo ⚠️  Validation script not found. Skipping validation.
)

echo.
echo 📋 Next Steps:
echo.
echo 1. Login to Railway:
echo    railway login
echo.
echo 2. Navigate to backend:
echo    cd backend
echo.
echo 3. Initialize Railway project:
echo    railway init
echo.
echo 4. Deploy backend:
echo    railway up
echo.
echo 5. Set environment variables in Railway Dashboard:
echo    - MONGO_URI (or use Railway's MongoDB plugin)
echo    - JWT_SECRET
echo    - CORS_ORIGIN
echo.
echo 6. Repeat for frontend:
echo    cd ..\frontend
echo    railway init
echo    Set VITE_API_URL variable
echo    railway up
echo.
echo 📖 See RAILWAY_DEPLOYMENT.md for detailed instructions
echo.
pause
