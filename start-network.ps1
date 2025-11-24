# Start Cloud PA with Network Access (for iPhone/iPad testing)
# This allows access from devices on the same Wi-Fi network

Write-Host "`n🌐 Starting Cloud PA with Network Access...`n" -ForegroundColor Cyan

# Get network IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -like "192.168.*" -or 
    $_.IPAddress -like "10.*" -or 
    ($_.IPAddress -like "172.*" -and [int]($_.IPAddress.Split('.')[1]) -ge 16 -and [int]($_.IPAddress.Split('.')[1]) -le 31)
} | Select-Object -First 1).IPAddress

if (-not $ip) {
    Write-Host "⚠️  Could not detect network IP address." -ForegroundColor Yellow
    Write-Host "   Make sure you're connected to Wi-Fi.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Detected Network IP: $ip`n" -ForegroundColor Green
Write-Host "📱 Access URLs:" -ForegroundColor Cyan
Write-Host "   Web App:  http://$ip`:3000" -ForegroundColor White
Write-Host "   API:      http://$ip`:3001`n" -ForegroundColor White

Write-Host "📋 Instructions:" -ForegroundColor Yellow
Write-Host "   1. Make sure iPhone is on the same Wi-Fi network" -ForegroundColor White
Write-Host "   2. Open Safari on iPhone" -ForegroundColor White
Write-Host "   3. Go to: http://$ip`:3000`n" -ForegroundColor White

Write-Host "🔧 Checking firewall rules...`n" -ForegroundColor Cyan

# Check if firewall rules exist
$webRule = Get-NetFirewallRule -DisplayName "Node.js Web (Cloud PA)" -ErrorAction SilentlyContinue
$apiRule = Get-NetFirewallRule -DisplayName "Node.js API (Cloud PA)" -ErrorAction SilentlyContinue

if (-not $webRule) {
    Write-Host "   Adding firewall rule for port 3000..." -ForegroundColor Gray
    New-NetFirewallRule -DisplayName "Node.js Web (Cloud PA)" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "   ✅ Firewall rule added for port 3000" -ForegroundColor Green
} else {
    Write-Host "   ✅ Firewall rule exists for port 3000" -ForegroundColor Green
}

if (-not $apiRule) {
    Write-Host "   Adding firewall rule for port 3001..." -ForegroundColor Gray
    New-NetFirewallRule -DisplayName "Node.js API (Cloud PA)" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "   ✅ Firewall rule added for port 3001" -ForegroundColor Green
} else {
    Write-Host "   ✅ Firewall rule exists for port 3001" -ForegroundColor Green
}

Write-Host "`n🚀 Starting servers...`n" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop both servers`n" -ForegroundColor Gray

# Start both servers
& pnpm dev:network

