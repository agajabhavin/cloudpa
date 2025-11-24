# Test Network Access for Cloud PA
# This script helps diagnose iPhone access issues

Write-Host ""
Write-Host "Cloud PA Network Access Diagnostic" -ForegroundColor Cyan
Write-Host ""

# Get network IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -like "192.168.*" -or 
    $_.IPAddress -like "10.*" -or 
    ($_.IPAddress -like "172.*" -and [int]($_.IPAddress.Split('.')[1]) -ge 16 -and [int]($_.IPAddress.Split('.')[1]) -le 31)
} | Select-Object -First 1).IPAddress

if (-not $ip) {
    Write-Host "Could not detect network IP address." -ForegroundColor Red
    Write-Host "Make sure you are connected to Wi-Fi." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "Network IP: $ip" -ForegroundColor Green
Write-Host ""

# Check if servers are running
Write-Host "Checking servers..." -ForegroundColor Cyan
Write-Host ""

$webPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$apiPort = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if (-not $webPort) {
    Write-Host "Web server (port 3000) is NOT running" -ForegroundColor Red
    Write-Host "Run: pnpm dev:network" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "Web server (port 3000) is running" -ForegroundColor Green
    Write-Host "URL: http://${ip}:3000" -ForegroundColor White
}

if (-not $apiPort) {
    Write-Host "API server (port 3001) is NOT running" -ForegroundColor Red
    Write-Host "Run: pnpm dev:network" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "API server (port 3001) is running" -ForegroundColor Green
    Write-Host "URL: http://${ip}:3001" -ForegroundColor White
}

Write-Host ""
Write-Host "Checking firewall rules..." -ForegroundColor Cyan
Write-Host ""

$webRule = Get-NetFirewallRule -DisplayName "Node.js Web (Cloud PA)" -ErrorAction SilentlyContinue
$apiRule = Get-NetFirewallRule -DisplayName "Node.js API (Cloud PA)" -ErrorAction SilentlyContinue

if (-not $webRule) {
    Write-Host "Firewall rule missing for port 3000" -ForegroundColor Yellow
    Write-Host "Adding firewall rule..." -ForegroundColor Gray
    New-NetFirewallRule -DisplayName "Node.js Web (Cloud PA)" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "Firewall rule added" -ForegroundColor Green
} else {
    Write-Host "Firewall rule exists for port 3000" -ForegroundColor Green
}

if (-not $apiRule) {
    Write-Host "Firewall rule missing for port 3001" -ForegroundColor Yellow
    Write-Host "Adding firewall rule..." -ForegroundColor Gray
    New-NetFirewallRule -DisplayName "Node.js API (Cloud PA)" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "Firewall rule added" -ForegroundColor Green
} else {
    Write-Host "Firewall rule exists for port 3001" -ForegroundColor Green
}

Write-Host ""
Write-Host "iPhone Access Instructions:" -ForegroundColor Cyan
Write-Host "1. Make sure iPhone is on the SAME Wi-Fi network" -ForegroundColor White
Write-Host "2. Open Safari on iPhone" -ForegroundColor White
Write-Host "3. Go to: http://${ip}:3000" -ForegroundColor Green
Write-Host ""

Write-Host "Testing API connectivity..." -ForegroundColor Cyan
Write-Host ""

try {
    $body = @{email="test";password="test"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://${ip}:3001/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "API is accessible from network" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "API is accessible (401 is expected for invalid credentials)" -ForegroundColor Green
    } else {
        Write-Host "API connectivity test failed: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "This might be normal if servers just started" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Troubleshooting Tips:" -ForegroundColor Cyan
Write-Host "• If login fails, check browser console (Safari -> Develop -> Show Web Inspector)" -ForegroundColor White
Write-Host "• Make sure both servers are running: pnpm dev:network" -ForegroundColor White
Write-Host "• Try accessing http://${ip}:3001/api/v1/auth/login directly in Safari" -ForegroundColor White
Write-Host "• Check Windows Firewall settings if still not working" -ForegroundColor White
Write-Host ""

Write-Host "All checks complete!" -ForegroundColor Green
Write-Host ""
