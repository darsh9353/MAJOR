@echo off
echo 🎯 AI Resume Screening Application
echo ==================================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 16 or higher
    pause
    exit /b 1
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo ⚠️  Creating .env file from template...
    copy env.example .env
    echo ✅ Created .env file
    echo ⚠️  Please update .env file with your email credentials
)

echo.
echo 🚀 Starting application...
echo.

REM Start backend server
start "Backend Server" python app.py

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
start "Frontend Server" npm start

echo.
echo ==================================================
echo 🎉 Application is starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo.
echo 💡 Tips:
echo    - Make sure to update .env file with your email credentials
echo    - Upload resumes in PDF or DOCX format
echo    - Set up job requirements before screening resumes
echo.
echo 🛑 Close this window to stop the application
echo.

pause
