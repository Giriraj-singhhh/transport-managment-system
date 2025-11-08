@echo off
setlocal enabledelayedexpansion

echo 🚌 College Transport Management System Setup
echo ==============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js is installed: !NODE_VERSION!
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ npm is not installed. Please install npm.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✓ npm is installed: !NPM_VERSION!
)

echo.
echo ℹ Starting setup process...
echo.

REM Install dependencies
echo ℹ Installing dependencies...
echo ℹ Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ✗ Failed to install root dependencies
    pause
    exit /b 1
)

echo ℹ Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ✗ Failed to install server dependencies
    pause
    exit /b 1
)
cd ..

echo ℹ Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ✗ Failed to install client dependencies
    pause
    exit /b 1
)
cd ..

echo ✓ All dependencies installed successfully
echo.

REM Setup environment variables
echo ℹ Setting up environment variables...
if not exist .env (
    copy .env.example .env >nul
    echo ✓ Created .env file from .env.example
    echo ⚠ Please edit .env file with your configuration
) else (
    echo ⚠ .env file already exists. Skipping creation.
)
echo.

REM Create necessary directories
echo ℹ Creating necessary directories...
if not exist server\uploads mkdir server\uploads
if not exist server\logs mkdir server\logs
if not exist client\public\uploads mkdir client\public\uploads
echo ✓ Directories created successfully
echo.

REM Build frontend
echo ℹ Building frontend...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ⚠ Frontend build failed. You may need to run it manually later.
) else (
    echo ✓ Frontend built successfully
)
cd ..
echo.

echo ✓ Setup completed successfully!
echo.
echo ℹ Next steps:
echo 1. Edit .env file with your configuration
echo 2. Start development servers with: npm run dev
echo 3. Open http://localhost:3000 in your browser
echo.
echo ℹ Available scripts:
echo - npm run dev          # Start development servers
echo - npm run server       # Start backend server only
echo - npm run client       # Start frontend server only
echo - npm run build        # Build for production
echo - npm run test         # Run tests
echo.
echo ℹ Documentation:
echo - README.md            # Project overview
echo - docs\DEVELOPMENT.md  # Development guide
echo - docs\API.md          # API documentation
echo - docs\DEPLOYMENT.md   # Deployment guide
echo.
pause
