# Start Cloud PA Servers
# This script builds the API first, then starts both servers

Write-Host "🚀 Starting Cloud PA Servers...`n" -ForegroundColor Cyan

# Step 1: Build API
Write-Host "Step 1: Building API..." -ForegroundColor Yellow
Set-Location "apps\api"
pnpm build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "Trying to fix and rebuild..." -ForegroundColor Yellow
    
    # Try to fix common issues
    pnpm prisma generate
    pnpm install
    pnpm build
}

if (-not (Test-Path "dist\main.js")) {
    Write-Host "❌ Build still failed. dist/main.js not found." -ForegroundColor Red
    Write-Host "`nTrying development mode instead (no build needed)...`n" -ForegroundColor Yellow
    Set-Location "..\.."
    
    # Start in dev mode (separate processes)
    Write-Host "Starting API in development mode..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\api; pnpm dev"
    
    Start-Sleep -Seconds 3
    
    Write-Host "Starting Web in development mode..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web; pnpm dev"
    
    Write-Host "`n✅ Servers starting in separate windows!" -ForegroundColor Green
    Write-Host "   - API: http://localhost:3001" -ForegroundColor White
    Write-Host "   - Web: http://localhost:3000`n" -ForegroundColor White
    exit 0
}

Write-Host "✅ Build successful!`n" -ForegroundColor Green

# Step 2: Start servers
Set-Location "..\.."
Write-Host "Step 2: Starting servers...`n" -ForegroundColor Yellow
Write-Host "Starting both API and Web servers..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Gray

pnpm dev

