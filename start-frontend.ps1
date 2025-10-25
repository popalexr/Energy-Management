# Start Frontend Development Server

Write-Host "Starting Energy Management Frontend..." -ForegroundColor Cyan
Write-Host ""

$frontendDir = Join-Path $PSScriptRoot "frontend\energy"

if (-not (Test-Path $frontendDir)) {
    Write-Host "Error: frontend directory not found" -ForegroundColor Red
    exit 1
}

Set-Location $frontendDir

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Frontend will be available at http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

npm run dev
