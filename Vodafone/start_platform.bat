@echo off
echo Starting CyberSecurity Training Platform...
echo.

echo Starting Flask Backend...
cd backend
start "Flask Backend" cmd /k "python app.py"
cd ..

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting React Frontend...
cd frontend
start "React Frontend" cmd /k "npm start"
cd ..

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul








