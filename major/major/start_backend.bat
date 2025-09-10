@echo off
echo Starting AI Resume Screening Backend...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/update requirements
echo Installing requirements...
pip install -r requirements.txt

REM Initialize database
echo Initializing database...
python init_db.py

REM Start the backend server
echo Starting backend server...
echo.
echo Backend will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python app.py

pause
