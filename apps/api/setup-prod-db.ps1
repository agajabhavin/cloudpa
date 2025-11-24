# Production Database Setup Script
# Run this from apps/api directory

# Set your database password here
$DB_PASSWORD = "YOUR_DATABASE_PASSWORD_HERE"
$env:DATABASE_URL = "postgresql://doadmin:${DB_PASSWORD}@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require"

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "║     🚀 PRODUCTION DATABASE SETUP                             ║" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📋 Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com" -ForegroundColor White
Write-Host "  Port: 25060" -ForegroundColor White
Write-Host "  Database: defaultdb" -ForegroundColor White
Write-Host "  User: doadmin" -ForegroundColor White
Write-Host "  SSL: Required`n" -ForegroundColor White

Write-Host "📦 Step 1: Generating Prisma Client...`n" -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "`n✅ Prisma Client generated`n" -ForegroundColor Green
} catch {
    Write-Host "`n⚠️  Error generating Prisma Client: $_`n" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Step 2: Running Database Migrations...`n" -ForegroundColor Yellow
try {
    npx prisma migrate deploy
    Write-Host "`n✅ Migrations completed successfully!`n" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Migration failed: $_`n" -ForegroundColor Red
    Write-Host "💡 Check:" -ForegroundColor Yellow
    Write-Host "  - Database is accessible" -ForegroundColor White
    Write-Host "  - Connection string is correct" -ForegroundColor White
    Write-Host "  - SSL is enabled`n" -ForegroundColor White
    exit 1
}

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║     ✅ PRODUCTION DATABASE SETUP COMPLETE!                     ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Set up Redis (if using BullMQ)" -ForegroundColor White
Write-Host "  2. Configure Twilio environment variables" -ForegroundColor White
Write-Host "  3. Create ChatAccount record" -ForegroundColor White
Write-Host "  4. Configure Twilio webhook`n" -ForegroundColor White

