# Energy Management System - Installation Script
# This script helps automate the setup process

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Energy Management System - Setup Script  " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

# Function to check if command exists
function Test-Command {
    param($command)
    $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "[OK] npm installed: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] npm not found" -ForegroundColor Red
    exit 1
}

if (Test-Command "psql") {
    Write-Host "[OK] PostgreSQL client (psql) found" -ForegroundColor Green
} else {
    Write-Host "[WARNING] PostgreSQL client not found in PATH" -ForegroundColor Yellow
    Write-Host "          Please install PostgreSQL or add it to PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Step 1: Database Setup                    " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$setupDb = Read-Host "Do you want to setup the database? (y/n)"

if ($setupDb -eq "y") {
    Write-Host "Creating database 'energy_management'..." -ForegroundColor Yellow
    
    $dbUser = Read-Host "Enter PostgreSQL username (default: postgres)"
    if ([string]::IsNullOrWhiteSpace($dbUser)) {
        $dbUser = "postgres"
    }
    
    try {
        # Create database
        psql -U $dbUser -c "CREATE DATABASE energy_management;" 2>&1 | Out-Null
        
        # Run schema
        $schemaFile = Join-Path $rootDir "backend\schema.sql"
        if (Test-Path $schemaFile) {
            psql -U $dbUser -d energy_management -f $schemaFile
            Write-Host "[OK] Database schema created successfully" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Schema file not found: $schemaFile" -ForegroundColor Red
        }
    } catch {
        Write-Host "[WARNING] Database setup encountered issues" -ForegroundColor Yellow
        Write-Host "          You may need to set it up manually" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Step 2: Backend Setup                     " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$backendDir = Join-Path $rootDir "backend"

Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location $backendDir
npm install

# Create .env if it doesn't exist
$envFile = Join-Path $backendDir ".env"
$envExample = Join-Path $backendDir ".env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "[OK] Created .env file from template" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Please configure the following in .env:" -ForegroundColor Yellow
        
        $modbusHost = Read-Host "Enter ECAM Modbus IP address (default: 192.168.1.100)"
        if ([string]::IsNullOrWhiteSpace($modbusHost)) {
            $modbusHost = "192.168.1.100"
        }
        
        $dbPassword = Read-Host "Enter PostgreSQL password (default: postgres)"
        if ([string]::IsNullOrWhiteSpace($dbPassword)) {
            $dbPassword = "postgres"
        }
        
        # Update .env file
        $envContent = Get-Content $envFile
        $envContent = $envContent -replace "MODBUS_HOST=.*", "MODBUS_HOST=$modbusHost"
        $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$dbPassword"
        $envContent | Set-Content $envFile
        
        Write-Host "[OK] .env file configured" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Step 3: Frontend Setup                    " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$frontendDir = Join-Path $rootDir "frontend\energy"

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location $frontendDir
npm install

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!                           " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Start Backend:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Start Frontend (in a new terminal):" -ForegroundColor Yellow
Write-Host "   cd frontend\energy" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Open browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Configuration files:" -ForegroundColor Cyan
Write-Host "   Backend: backend\.env" -ForegroundColor White
Write-Host "   Frontend: frontend\energy\.env" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

Set-Location $rootDir

$startNow = Read-Host "Do you want to start the servers now? (y/n)"

if ($startNow -eq "y") {
    Write-Host ""
    Write-Host "Starting servers..." -ForegroundColor Yellow
    Write-Host "Backend will start in this window" -ForegroundColor Yellow
    Write-Host "Frontend will start in a new window" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the backend server" -ForegroundColor Yellow
    Write-Host ""
    
    # Start frontend in new window
    $frontendDir = Join-Path $rootDir "frontend\energy"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"
    
    # Start backend in current window
    $backendDir = Join-Path $rootDir "backend"
    Set-Location $backendDir
    npm run dev
}
