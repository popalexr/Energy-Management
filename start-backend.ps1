# Start Backend Server

Write-Host "Starting Energy Management Backend Server..." -ForegroundColor Cyan
Write-Host ""

$backendDir = Join-Path $PSScriptRoot "backend"

if (-not (Test-Path $backendDir)) {
    Write-Host "Error: backend directory not found" -ForegroundColor Red
    exit 1
}

Set-Location $backendDir

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "Creating from .env.example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Please edit backend\.env with your configuration" -ForegroundColor Yellow
        notepad ".env"
    } else {
        Write-Host "Error: .env.example not found" -ForegroundColor Red
        exit 1
    }
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Starting server on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

npm run dev
