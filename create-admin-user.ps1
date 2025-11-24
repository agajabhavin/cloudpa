# Create Admin User Script
# This script starts the API server and creates the admin user

Write-Host "🔧 Creating Admin User: admin@winpilot.io`n" -ForegroundColor Cyan

# Step 1: Delete existing user
Write-Host "Step 1: Deleting existing user if exists..." -ForegroundColor Yellow
$env:PGPASSWORD = "Umlup01cli#@Ynkyo01xku#@6969"
$sql = "DELETE FROM `"User`" WHERE email = 'admin@winpilot.io';"
psql -U postgres -d cloudpa -c $sql 2>&1 | Out-Null
Write-Host "✅ Cleaned up existing user`n" -ForegroundColor Green

# Step 2: Check if API is running
Write-Host "Step 2: Checking API server..." -ForegroundColor Yellow
$api = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if (-not $api) {
    Write-Host "⚠️  API server not running. Starting it..." -ForegroundColor Yellow
    Write-Host "   (This will open a new window)" -ForegroundColor Gray
    
    # Start API in background
    $apiProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Bhavin\CloudPA.io\apps\api; pnpm dev" -PassThru
    
    Write-Host "   Waiting for API to start (15 seconds)..." -ForegroundColor Gray
    $timeout = 15
    $elapsed = 0
    
    while ($elapsed -lt $timeout) {
        Start-Sleep -Seconds 2
        $elapsed += 2
        $api = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
        if ($api) {
            Write-Host "   ✅ API server is running!`n" -ForegroundColor Green
            break
        }
        Write-Host "   ... still waiting ($elapsed/$timeout seconds)" -ForegroundColor Gray
    }
    
    if (-not $api) {
        Write-Host "`n❌ API server didn't start in time" -ForegroundColor Red
        Write-Host "`nPlease start it manually:" -ForegroundColor Yellow
        Write-Host "   cd apps\api" -ForegroundColor White
        Write-Host "   pnpm dev`n" -ForegroundColor White
        Write-Host "Then run this script again, or create user via web:" -ForegroundColor Yellow
        Write-Host "   http://localhost:3000/signup`n" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "✅ API server is already running`n" -ForegroundColor Green
}

# Step 3: Create user via API
Write-Host "Step 3: Creating user via API..." -ForegroundColor Yellow
$body = @{
    email = "admin@winpilot.io"
    password = "cloudpa123"
    name = "Admin User"
    orgName = "WinPilot"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10
    
    Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "✅ USER CREATED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Login Credentials:" -ForegroundColor Yellow
    Write-Host "  Email:    admin@winpilot.io" -ForegroundColor White
    Write-Host "  Password: cloudpa123" -ForegroundColor White
    Write-Host "  Org:      WinPilot" -ForegroundColor White
    Write-Host ""
    Write-Host "Login URL: http://localhost:3000/login" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "`n❌ Failed to create user:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nAlternative: Create user via web signup:" -ForegroundColor Yellow
    Write-Host "  http://localhost:3000/signup`n" -ForegroundColor White
}

