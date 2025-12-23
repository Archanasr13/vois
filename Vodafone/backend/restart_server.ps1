Write-Host "Stopping any running python servers..."
Stop-Process -Name python -Force -ErrorAction SilentlyContinue

Write-Host "Starting backend server (app.py)..."
Start-Process -FilePath "python" -ArgumentList "app.py" -WorkingDirectory "c:\Users\LENOVO\Documents\Vodafone\Project\backend" -NoNewWindow

Write-Host "Backend restarted! Please check the output above for 'CYBER HEALTH DASHBOARD READY'."
