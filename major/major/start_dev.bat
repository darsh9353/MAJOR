@echo off
echo Starting AI Resume Screening Application in Development Mode
echo =====================================================
echo.

:: Start the backend server in a new window
start cmd /k "title Backend Server && python app.py"

:: Wait for backend to initialize
echo Waiting for backend server to initialize...
echo This may take up to 15 seconds...
timeout /t 15 /nobreak > nul

:: Start the frontend server in a new window
echo Starting frontend server...
start cmd /k "title Frontend Server && npm start"

echo.
echo Both servers should now be running in separate windows.
echo If you still see proxy errors, try increasing the timeout value in this script.