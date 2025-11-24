# Twilio WhatsApp Setup Script for Windows
# This script helps set up Twilio WhatsApp integration

Write-Host "`n🚀 Twilio WhatsApp Setup`n" -ForegroundColor Cyan

# Step 1: Check .env file
Write-Host "Step 1: Checking environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "  ⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  ✅ Created .env file. Please add your Twilio credentials." -ForegroundColor Green
    } else {
        Write-Host "  ❌ .env.example not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✅ .env file exists" -ForegroundColor Green
}

# Step 2: Load .env and check Twilio vars
$envContent = Get-Content ".env" -Raw
$hasAccountSid = $envContent -match "TWILIO_ACCOUNT_SID\s*="
$hasAuthToken = $envContent -match "TWILIO_AUTH_TOKEN\s*="

if (-not $hasAccountSid -or -not $hasAuthToken) {
    Write-Host "`n  ⚠️  Twilio credentials not configured in .env" -ForegroundColor Yellow
    Write-Host "  Please add:" -ForegroundColor White
    Write-Host "    TWILIO_ACCOUNT_SID=your_twilio_account_sid_here" -ForegroundColor Gray
    Write-Host "    TWILIO_AUTH_TOKEN=your_twilio_auth_token_here" -ForegroundColor Gray
    Write-Host "    TWILIO_WHATSAPP_FROM=whatsapp:+14155238886" -ForegroundColor Gray
    Write-Host "    PUBLIC_BASE_URL=http://localhost:3001" -ForegroundColor Gray
} else {
    Write-Host "  ✅ Twilio credentials found in .env" -ForegroundColor Green
}

# Step 3: Build check
Write-Host "`nStep 2: Checking build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Write-Host "  ✅ dist folder exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  dist folder not found. Run 'pnpm build' first." -ForegroundColor Yellow
}

# Step 4: Instructions
Write-Host "`n📋 Next Steps:`n" -ForegroundColor Cyan
Write-Host "1. Add Twilio credentials to apps/api/.env" -ForegroundColor White
Write-Host "2. Get your orgId (from database or API response)" -ForegroundColor White
Write-Host "3. Create ChatAccount:" -ForegroundColor White
Write-Host "   Option A - Via API (after login):" -ForegroundColor Gray
Write-Host "     POST /api/v1/org/chat-accounts" -ForegroundColor Gray
Write-Host "     Body: {`"provider`":`"twilio_whatsapp`",`"externalPhoneId`":`"whatsapp:+14155238886`"}" -ForegroundColor Gray
Write-Host "   Option B - Via Script:" -ForegroundColor Gray
Write-Host "     npx ts-node src/scripts/setup-twilio.ts <your-org-id>" -ForegroundColor Gray
Write-Host "4. Configure Twilio webhook URL in Twilio Console" -ForegroundColor White
Write-Host "5. Start services:" -ForegroundColor White
Write-Host "   Terminal 1: pnpm dev" -ForegroundColor Gray
Write-Host "   Terminal 2: pnpm build && pnpm worker:inbound" -ForegroundColor Gray
Write-Host "`n✅ Setup script complete!`n" -ForegroundColor Green

