# Test Login and Create Admin User if needed

Write-Host ""
Write-Host "Testing Login for admin@cloudpa.io" -ForegroundColor Cyan
Write-Host ""

# Test login API
$body = @{
    email = "admin@cloudpa.io"
    password = "cloudpa123"
} | ConvertTo-Json

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -like "192.168.*" -or 
    $_.IPAddress -like "10.*" -or 
    ($_.IPAddress -like "172.*" -and [int]($_.IPAddress.Split('.')[1]) -ge 16 -and [int]($_.IPAddress.Split('.')[1]) -le 31)
} | Select-Object -First 1).IPAddress

if (-not $ip) {
    $ip = "localhost"
}

Write-Host "Testing API at: http://${ip}:3001/api/v1/auth/login" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://${ip}:3001/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "SUCCESS! Login works!" -ForegroundColor Green
    Write-Host "Token received: $($response.access_token.Substring(0, 20))..." -ForegroundColor Green
    Write-Host ""
    Write-Host "User ID: $($response.userId)" -ForegroundColor White
    Write-Host "Org ID: $($response.orgId)" -ForegroundColor White
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.ErrorDetails.Message
    
    Write-Host "Login FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 401) {
        Write-Host ""
        Write-Host "Invalid credentials - User might not exist or password is wrong" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Creating admin user via API..." -ForegroundColor Cyan
        
        # Try to create user via signup
        $signupBody = @{
            email = "admin@cloudpa.io"
            password = "cloudpa123"
            name = "Admin"
            orgName = "Cloud PA"
        } | ConvertTo-Json
        
        try {
            $signupResponse = Invoke-RestMethod -Uri "http://${ip}:3001/api/v1/auth/signup" -Method POST -Body $signupBody -ContentType "application/json" -ErrorAction Stop
            Write-Host "SUCCESS! User created!" -ForegroundColor Green
            Write-Host "Token: $($signupResponse.access_token.Substring(0, 20))..." -ForegroundColor Green
            Write-Host ""
            Write-Host "You can now login with:" -ForegroundColor Cyan
            Write-Host "  Email: admin@cloudpa.io" -ForegroundColor White
            Write-Host "  Password: cloudpa123" -ForegroundColor White
        } catch {
            Write-Host "Failed to create user: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response.StatusCode.value__ -eq 400) {
                Write-Host "User might already exist. Try checking the database." -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "Error: $errorMessage" -ForegroundColor Red
        Write-Host ""
        Write-Host "Possible issues:" -ForegroundColor Yellow
        Write-Host "1. API server not running - Run: pnpm dev:network" -ForegroundColor White
        Write-Host "2. Network connectivity issue" -ForegroundColor White
        Write-Host "3. CORS issue (check API logs)" -ForegroundColor White
    }
}

Write-Host ""

