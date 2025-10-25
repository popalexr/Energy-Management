# Quick Setup Script for Testing (Mock Mode)
# This sets up the application with simulated data for testing

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Energy Management - Quick Setup           " -ForegroundColor Cyan
Write-Host "  Mock Mode (No Hardware Required)          " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

# Step 1: Backend Setup
Write-Host "Step 1: Setting up Backend..." -ForegroundColor Yellow
$backendDir = Join-Path $rootDir "backend"

if (Test-Path $backendDir) {
    Set-Location $backendDir
    
    # Check if .env exists
    if (-not (Test-Path ".env")) {
        Write-Host "Creating .env file with MOCK_MODE enabled..." -ForegroundColor Yellow
        
        # Create .env with mock mode
        $envContent = @"
# Server Configuration
PORT=3000
NODE_ENV=development

# Mock Mode (set to true to use simulated data without hardware)
MOCK_MODE=true

# Modbus Configuration (not used in mock mode)
MODBUS_HOST=192.168.1.100
MODBUS_PORT=502
MODBUS_UNIT_ID=1
POLL_INTERVAL_SECONDS=5

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=energy_management
DB_USER=postgres
DB_PASSWORD=postgres

# Location Configuration
LOCATION_SALA_SPORT=sala-sport
LOCATION_CORP_A=corp-a
LOCATION_CORP_B=corp-b
LOCATION_AULA_1=aula-1
LOCATION_AULA_2=aula-2
"@
        
        Set-Content -Path ".env" -Value $envContent
        Write-Host "✅ Created .env with MOCK_MODE=true" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  .env file already exists" -ForegroundColor Cyan
        Write-Host "   Make sure MOCK_MODE=true is set in backend\.env" -ForegroundColor Yellow
    }
    
    # Install backend dependencies
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Backend directory not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Frontend Setup
Write-Host "Step 2: Setting up Frontend..." -ForegroundColor Yellow
$frontendDir = Join-Path $rootDir "frontend\energy"

if (Test-Path $frontendDir) {
    Set-Location $frontendDir
    
    # Install frontend dependencies
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Frontend directory not found" -ForegroundColor Red
    exit 1
}

Set-Location $rootDir

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Setup Complete!                           " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎭 MOCK MODE is ENABLED" -ForegroundColor Cyan
Write-Host "   The application will generate simulated data" -ForegroundColor Cyan
Write-Host "   No hardware connection required!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure PostgreSQL is installed and running" -ForegroundColor White
Write-Host "2. Create the database:" -ForegroundColor White
Write-Host "   psql -U postgres -c `"CREATE DATABASE energy_management;`"" -ForegroundColor Gray
Write-Host "   psql -U postgres -d energy_management -f backend\schema.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the application:" -ForegroundColor White
Write-Host "   .\start-all.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "To disable mock mode (when you have hardware):" -ForegroundColor Yellow
Write-Host "   Edit backend\.env and set MOCK_MODE=false" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to create database now
Write-Host "Would you like to create the database now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host ""
    Write-Host "Creating database..." -ForegroundColor Yellow
    
    # Create database
    $createDb = psql -U postgres -c "CREATE DATABASE energy_management;" 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $createDb -like "*already exists*") {
        Write-Host "✅ Database created (or already exists)" -ForegroundColor Green
        
        # Run schema
        Write-Host "Running schema..." -ForegroundColor Yellow
        $schemaPath = Join-Path $rootDir "backend\schema.sql"
        psql -U postgres -d energy_management -f $schemaPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database schema created" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Schema may have failed, but continuing..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Could not create database" -ForegroundColor Yellow
        Write-Host "   Please run manually:" -ForegroundColor Yellow
        Write-Host "   psql -U postgres -c `"CREATE DATABASE energy_management;`"" -ForegroundColor Gray
        Write-Host "   psql -U postgres -d energy_management -f backend\schema.sql" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Setup complete! Run .\start-all.ps1 to launch the application" -ForegroundColor Green
Write-Host ""
