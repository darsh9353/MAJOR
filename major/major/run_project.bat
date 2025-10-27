@echo off
echo ===============================================
echo    AI Resume Screening Application
echo ===============================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "python app.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm start"

echo.
echo ===============================================
echo    Application Started Successfully!
echo ===============================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Both servers are running in separate windows.
echo Close the windows to stop the servers.
echo.
pause
