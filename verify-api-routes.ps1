# Verify API Routes
Write-Host "🔍 Verifying API Routes...`n" -ForegroundColor Cyan

$token = "test-token" # You'll need a real token for authenticated routes
$baseUrl = "http://localhost:3001"

Write-Host "Testing routes (expecting 404 or 401 without valid token):`n" -ForegroundColor Yellow

# Test public routes
Write-Host "1. Testing /api/v1/auth/login (POST)..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test","password":"test"}' -ErrorAction Stop
    Write-Host "   ✅ Route exists (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ❌ Route NOT FOUND - Server may not be running or routes not registered" -ForegroundColor Red
    } elseif ($_.Exception.Response.StatusCode -eq 400 -or $_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✅ Route exists (Status: $($_.Exception.Response.StatusCode)) - Expected for invalid credentials" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n2. Testing /api/v1/auth/me (GET)..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/me" -Method GET -Headers @{"Authorization"="Bearer $token"} -ErrorAction Stop
    Write-Host "   ✅ Route exists (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ❌ Route NOT FOUND - Check if server is running with global prefix" -ForegroundColor Red
    } elseif ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✅ Route exists (Status: 401) - Expected without valid token" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n3. Testing /api/v1/org/me (GET)..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/org/me" -Method GET -Headers @{"Authorization"="Bearer $token"} -ErrorAction Stop
    Write-Host "   ✅ Route exists (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ❌ Route NOT FOUND - Check if server is running with global prefix" -ForegroundColor Red
    } elseif ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✅ Route exists (Status: 401) - Expected without valid token" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n💡 If routes return 404, restart the API server:" -ForegroundColor Cyan
Write-Host "   cd apps\api" -ForegroundColor White
Write-Host "   pnpm dev`n" -ForegroundColor White

