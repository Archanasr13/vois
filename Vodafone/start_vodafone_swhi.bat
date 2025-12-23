@echo off
REM Quick Start Script for Vodafone + SWHI Platform
REM This script starts both backend and frontend servers

echo ============================================================
echo Vodafone Cybersecurity Training Platform + SWHI
echo ============================================================
echo.

REM Check if we're in the correct directory
if not exist "backend\app.py" (
    echo ERROR: Please run this script from the Vodafone root directory
    pause
    exit /b 1
)

echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)
echo Python OK

echo.
echo [2/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)
echo Node.js OK

echo.
echo [3/5] Checking backend dependencies...
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo Installing backend dependencies...
    cd backend
    pip install -r requirements.txt
    cd ..
    echo Backend dependencies installed
) else (
    echo Backend dependencies OK
)

echo.
echo [4/5] Checking frontend dependencies...
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo Frontend dependencies installed
) else (
    echo Frontend dependencies OK
)

echo.
echo [5/5] Starting servers...
echo.
echo Starting Backend Server (Flask) on http://localhost:5000
echo Starting Frontend Server (React) on http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.

REM Start backend in a new window
start "Vodafone Backend" cmd /k "cd backend && python app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "Vodafone Frontend" cmd /k "cd frontend && npm start"

echo.
echo ============================================================
echo Servers are starting in separate windows
echo ============================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo SWHI is available at: http://localhost:3000/swhi
echo.
echo Close the separate terminal windows to stop the servers
echo.
pause
