@echo off
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or newer is required. Install it from https://nodejs.org/
  pause
  exit /b 1
)
cd /d "%~dp0"
set NODE_NO_WARNINGS=1
if not exist node_modules (
  echo Installing packages...
  call npm ci || exit /b 1
)
if not exist .next\BUILD_ID (
  echo Building the website...
  call npm run build || exit /b 1
)
echo Sprout and Crumb is starting on http://localhost:3002
call npm start
