# Start Both Backend and Frontend

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Energy Management System                  " -ForegroundColor Cyan
Write-Host "  Starting All Services                     " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

# Start Backend in new window
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendScript = Join-Path $rootDir "start-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", $backendScript

# Wait a bit for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendScript = Join-Path $rootDir "start-frontend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", $frontendScript

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Servers Started!                          " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check the new PowerShell windows for server logs" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop: Close the PowerShell windows or press Ctrl+C in each" -ForegroundColor Yellow
Write-Host ""

# Wait a bit then open browser
Start-Sleep -Seconds 5
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Setup complete! Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
