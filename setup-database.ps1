# Database Setup Script
# Creates the PostgreSQL database and schema for Energy Management System

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Database Setup                            " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Try to find PostgreSQL installation
$pgPaths = @(
    "C:\Program Files\PostgreSQL\18\bin",
    "C:\Program Files\PostgreSQL\17\bin",
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "C:\Program Files\PostgreSQL\13\bin",
    "C:\PostgreSQL\18\bin",
    "C:\PostgreSQL\17\bin",
    "C:\PostgreSQL\16\bin",
    "C:\PostgreSQL\15\bin",
    "C:\PostgreSQL\14\bin"
)

$psqlPath = $null
foreach ($path in $pgPaths) {
    $testPath = Join-Path $path "psql.exe"
    if (Test-Path $testPath) {
        $psqlPath = $path
        Write-Host "✅ Found PostgreSQL at: $psqlPath" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "❌ Could not find PostgreSQL installation" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL from:" -ForegroundColor Yellow
    Write-Host "https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or run manually after installation:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres -c `"CREATE DATABASE energy_management;`"" -ForegroundColor Gray
    Write-Host "  psql -U postgres -d energy_management -f backend\schema.sql" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Add to PATH for this session
$env:Path += ";$psqlPath"

Write-Host ""
Write-Host "Step 1: Creating database..." -ForegroundColor Yellow

# Create database
$createOutput = & "$psqlPath\psql.exe" -U postgres -c "CREATE DATABASE energy_management;" 2>&1

if ($LASTEXITCODE -eq 0 -or $createOutput -like "*already exists*") {
    Write-Host "✅ Database 'energy_management' created (or already exists)" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create database" -ForegroundColor Red
    Write-Host $createOutput -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. PostgreSQL service not running" -ForegroundColor White
    Write-Host "   Fix: Services → postgresql-x64-XX → Start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Wrong password" -ForegroundColor White
    Write-Host "   The script will prompt for password" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Step 2: Creating schema..." -ForegroundColor Yellow

# Get schema file path
$rootDir = $PSScriptRoot
$schemaPath = Join-Path $rootDir "backend\schema.sql"

if (-not (Test-Path $schemaPath)) {
    Write-Host "❌ Schema file not found at: $schemaPath" -ForegroundColor Red
    exit 1
}

# Apply schema
$schemaOutput = & "$psqlPath\psql.exe" -U postgres -d energy_management -f $schemaPath 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database schema created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Schema creation had issues:" -ForegroundColor Yellow
    Write-Host $schemaOutput -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 3: Verifying tables..." -ForegroundColor Yellow

# Check if tables were created
$checkTables = & "$psqlPath\psql.exe" -U postgres -d energy_management -c "\dt" 2>&1

if ($checkTables -like "*measurements*" -and $checkTables -like "*locations*") {
    Write-Host "✅ Tables verified:" -ForegroundColor Green
    Write-Host "   - measurements" -ForegroundColor Gray
    Write-Host "   - locations" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Tables verification:" -ForegroundColor Yellow
    Write-Host $checkTables -ForegroundColor Gray
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Database Setup Complete!                  " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure backend/.env has MOCK_MODE=true" -ForegroundColor White
Write-Host "2. Run: .\start-all.ps1" -ForegroundColor White
Write-Host "3. Open: http://localhost:5173" -ForegroundColor White
Write-Host ""
