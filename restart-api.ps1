# Restart API Server
Write-Host "🔄 Restarting API Server...`n" -ForegroundColor Cyan

# Kill existing API processes (running on port 3001)
Write-Host "Stopping existing API server..." -ForegroundColor Yellow
$apiProcesses = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($apiProcesses) {
    foreach ($pid in $apiProcesses) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  Stopped process $pid" -ForegroundColor Gray
    }
}

Start-Sleep -Seconds 2

# Start API server
Write-Host "`nStarting API server..." -ForegroundColor Yellow
Set-Location "apps\api"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm dev"
Set-Location "..\.."

Write-Host "`n✅ API server restarting in new window!" -ForegroundColor Green
Write-Host "   Wait 5-10 seconds for it to fully start, then try your request again.`n" -ForegroundColor White

