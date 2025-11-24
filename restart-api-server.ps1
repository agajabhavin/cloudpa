# Restart API Server Script
Write-Host "`n🛑 Stopping existing API server processes...`n" -ForegroundColor Yellow

# Stop all Node.js processes related to CloudPA API
Get-Process -Name "node" -ErrorAction SilentlyContinue | 
  Where-Object { $_.Path -like "*CloudPA.io\apps\api*" } | 
  Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Clean up old compiled JS files
Write-Host "🧹 Cleaning up old compiled files...`n" -ForegroundColor Cyan
Set-Location "apps\api"
Get-ChildItem -Path "src" -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "🚀 Starting API server in development mode...`n" -ForegroundColor Green
Write-Host "📋 Watch for:" -ForegroundColor Cyan
Write-Host "   - 'API running on http://localhost:3001'" -ForegroundColor White
Write-Host "   - Any compilation errors" -ForegroundColor White
Write-Host "   - Route registration messages`n" -ForegroundColor White
Write-Host "⚠️  Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Start the server (this will block until stopped)
pnpm dev

