@echo off
REM Horns & Heritage - Setup Script for Windows
REM This script helps set up the project for local development and deployment

echo.
echo Horns and Heritage - Setup
echo ==========================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo X Node.js is not installed. Please install Node.js 16+ first.
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo. OK Node.js is installed
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo X npm is not installed.
    pause
    exit /b 1
)

echo. OK npm is installed
npm --version

echo.
echo Installing dependencies...
call npm install

if errorlevel 1 (
    echo X Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. For local development: npm run dev
echo 2. To deploy: npm run deploy
echo 3. Read DEPLOYMENT_GUIDE.md for more details
echo.
pause
