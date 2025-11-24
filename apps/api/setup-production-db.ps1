# Production Database Setup Script
# Connects to DigitalOcean PostgreSQL and runs migrations

Write-Host "`n🚀 Production Database Setup`n" -ForegroundColor Cyan

# Database credentials
$DB_USER = "doadmin"
$DB_PASSWORD = "YOUR_DATABASE_PASSWORD_HERE"
$DB_HOST = "db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com"
$DB_PORT = "25060"
$DB_NAME = "defaultdb"

# Construct DATABASE_URL
$DATABASE_URL = "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"

Write-Host "📋 Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor White
Write-Host "  Port: $DB_PORT" -ForegroundColor White
Write-Host "  Database: $DB_NAME" -ForegroundColor White
Write-Host "  User: $DB_USER" -ForegroundColor White
Write-Host "  SSL: Required`n" -ForegroundColor White

# Set environment variable
$env:DATABASE_URL = $DATABASE_URL

Write-Host "✅ DATABASE_URL set in environment`n" -ForegroundColor Green

# Navigate to API directory
Set-Location "apps/api"

Write-Host "📦 Step 1: Generating Prisma Client...`n" -ForegroundColor Yellow
try {
    pnpm prisma:generate
    Write-Host "✅ Prisma Client generated`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Prisma generate warning (may already be generated): $_" -ForegroundColor Yellow
}

Write-Host "📦 Step 2: Running Database Migrations...`n" -ForegroundColor Yellow
try {
    pnpm prisma migrate deploy
    Write-Host "`n✅ Migrations completed successfully!`n" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Migration failed: $_" -ForegroundColor Red
    Write-Host "`n💡 Try running manually:" -ForegroundColor Yellow
    Write-Host "   cd apps/api" -ForegroundColor White
    Write-Host "   `$env:DATABASE_URL='$DATABASE_URL'" -ForegroundColor White
    Write-Host "   pnpm prisma migrate deploy`n" -ForegroundColor White
    exit 1
}

Write-Host "🔍 Step 3: Verifying Database Schema...`n" -ForegroundColor Yellow
try {
    $env:DATABASE_URL = $DATABASE_URL
    pnpm migrate:verify
    Write-Host "`n✅ Database verification complete!`n" -ForegroundColor Green
} catch {
    Write-Host "`n⚠️  Verification script failed (non-critical): $_`n" -ForegroundColor Yellow
}

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║     ✅ PRODUCTION DATABASE SETUP COMPLETE!                     ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Set up Redis (if using BullMQ fallback)" -ForegroundColor White
Write-Host "  2. Configure Twilio environment variables" -ForegroundColor White
Write-Host "  3. Create ChatAccount record" -ForegroundColor White
Write-Host "  4. Configure Twilio webhook`n" -ForegroundColor White

Write-Host "💾 Save this DATABASE_URL for App Platform:" -ForegroundColor Yellow
Write-Host "  $DATABASE_URL`n" -ForegroundColor Gray

