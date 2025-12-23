# Quick Verification Script
# Run this in PowerShell to verify all endpoints are working

Write-Host "`n🔍 TESTING CYBERSECURITY TRAINING PLATFORM`n" -ForegroundColor Cyan

# Test 1: Backend Health
Write-Host "Test 1: Backend Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -ErrorAction Stop
    Write-Host "✅ Backend is healthy: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed!" -ForegroundColor Red
    Write-Host "   Make sure backend is running: cd backend; python app.py" -ForegroundColor Yellow
}

# Test 2: Phishing Simulation
Write-Host "`nTest 2: Phishing Simulation..." -ForegroundColor Yellow
try {
    $sim = Invoke-RestMethod -Uri "http://localhost:5000/api/phishing/simulate?user_id=1" -ErrorAction Stop
    Write-Host "✅ Phishing simulation working" -ForegroundColor Green
    Write-Host "   Subject: $($sim.subject)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Phishing simulation failed!" -ForegroundColor Red
}

# Test 3: Leaderboard
Write-Host "`nTest 3: Leaderboard..." -ForegroundColor Yellow
try {
    $leaderboard = Invoke-RestMethod -Uri "http://localhost:5000/api/leaderboard/top-users" -ErrorAction Stop
    Write-Host "✅ Leaderboard working" -ForegroundColor Green
    Write-Host "   Top user: $($leaderboard.leaderboard[0].name) with score $($leaderboard.leaderboard[0].score)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Leaderboard failed!" -ForegroundColor Red
}

# Test 4: Threats
Write-Host "`nTest 4: Threat Intelligence..." -ForegroundColor Yellow
try {
    $threats = Invoke-RestMethod -Uri "http://localhost:5000/api/threats/feed" -ErrorAction Stop
    Write-Host "✅ Threat intelligence working" -ForegroundColor Green
    Write-Host "   Active threats: $($threats.threats.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Threat intelligence failed!" -ForegroundColor Red
}

# Test 5: Cyber Health
Write-Host "`nTest 5: Cyber Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/cyber-health/report" -ErrorAction Stop
    Write-Host "✅ Cyber health working" -ForegroundColor Green
    Write-Host "   Organization score: $($health.health_score)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Cyber health failed!" -ForegroundColor Red
}

# Test 6: Quiz Questions
Write-Host "`nTest 6: Quiz System..." -ForegroundColor Yellow
try {
    $quiz = Invoke-RestMethod -Uri "http://localhost:5000/api/get_quiz_questions?user_id=1&num=5" -ErrorAction Stop
    Write-Host "✅ Quiz system working" -ForegroundColor Green
    Write-Host "   Questions loaded: $($quiz.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Quiz system failed!" -ForegroundColor Red
}

# Test 7: Frontend
Write-Host "`nTest 7: Frontend Accessibility..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
    if ($frontend.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend not accessible!" -ForegroundColor Red
    Write-Host "   Make sure frontend is running: cd frontend; npm start" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "           TEST SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`nIf all tests passed (✅), your platform is working!" -ForegroundColor Green
Write-Host "Open browser to: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nDemo credentials:" -ForegroundColor Yellow
Write-Host "  Email: john.smith@company.com" -ForegroundColor Gray
Write-Host "  Password: password123" -ForegroundColor Gray
Write-Host "`n"
