# Restart Cloud PA Servers
# This script kills existing API and Web servers, then starts both fresh

Write-Host "🔄 Restarting Cloud PA Servers...`n" -ForegroundColor Cyan

# Step 1: Kill processes on ports 3001 (API) and 3000 (Web)
Write-Host "Stopping existing servers...`n" -ForegroundColor Yellow

# Kill API server (port 3001)
$apiProcess = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($apiProcess) {
    Write-Host "  Stopping API server (port 3001)..." -ForegroundColor Gray
    Stop-Process -Id $apiProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ API server stopped" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  No API server running on port 3001" -ForegroundColor Gray
}

# Kill Web server (port 3000)
$webProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($webProcess) {
    Write-Host "  Stopping Web server (port 3000)..." -ForegroundColor Gray
    Stop-Process -Id $webProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ Web server stopped" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  No Web server running on port 3000" -ForegroundColor Gray
}

# Also kill any node processes that might be running the servers
Write-Host "`n  Cleaning up any remaining node processes...`n" -ForegroundColor Gray
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*CloudPA.io*" -or 
    $_.CommandLine -like "*apps/api*" -or 
    $_.CommandLine -like "*apps/web*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment for ports to be released
Write-Host "  Waiting for ports to be released...`n" -ForegroundColor Gray
Start-Sleep -Seconds 2

# Step 2: Start both servers
Write-Host "🚀 Starting servers...`n" -ForegroundColor Cyan
Write-Host "  API: http://localhost:3001" -ForegroundColor White
Write-Host "  Web: http://localhost:3000`n" -ForegroundColor White
Write-Host "Press Ctrl+C to stop both servers`n" -ForegroundColor Gray

# Change to project root
Set-Location $PSScriptRoot

# Start both servers using pnpm dev
Write-Host "Starting servers...`n" -ForegroundColor Cyan
& pnpm dev

