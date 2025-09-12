@echo off
echo Checking for npm installation...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm not found in PATH. Please install Node.js and npm.
    echo Visit https://nodejs.org/ to download and install Node.js.
    exit /b 1
)

echo Building React frontend for production...
python start.py --build
echo.
echo Starting Flask server...
python app.py
