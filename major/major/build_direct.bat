@echo off
echo Building React frontend directly with npm...

REM Check if Node.js and npm are installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found in PATH. Please install Node.js and npm.
    echo Visit https://nodejs.org/ to download and install Node.js.
    exit /b 1
)

REM Build the React app directly
echo Running npm run build...
cd /d "%~dp0"
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build the React app.
    exit /b 1
)

echo.
echo Starting Flask server...
python app.py