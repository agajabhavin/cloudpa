# 🚀 Production Database Setup - DigitalOcean

## ✅ Your Database Credentials

```
Host: db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com
Port: 25060
Database: defaultdb
User: doadmin
Password: [YOUR_DATABASE_PASSWORD]
SSL: Required
```

## 📋 Connection String

```env
DATABASE_URL=postgresql://doadmin:[YOUR_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require
```

---

## 🛠️ Setup Steps

### Step 1: Navigate to API Directory

```powershell
cd C:\Bhavin\CloudPA.io\apps\api
```

### Step 2: Set Environment Variable

```powershell
$env:DATABASE_URL = "postgresql://doadmin:[YOUR_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
```

### Step 3: Generate Prisma Client

```powershell
npx prisma generate
```

**Or:**
```powershell
pnpm prisma:generate
```

### Step 4: Run Migrations

```powershell
npx prisma migrate deploy
```

**Or:**
```powershell
pnpm prisma migrate deploy
```

### Step 5: Verify Database (Optional)

```powershell
pnpm migrate:verify
```

---

## ✅ Quick Setup Script

Save this as `setup-prod-db.ps1` in `apps/api/`:

```powershell
# Production Database Setup
$env:DATABASE_URL = "postgresql://doadmin:[YOUR_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require"

Write-Host "`n🚀 Setting up production database...`n" -ForegroundColor Cyan

Write-Host "📦 Generating Prisma Client...`n" -ForegroundColor Yellow
npx prisma generate

Write-Host "`n📦 Running migrations...`n" -ForegroundColor Yellow
npx prisma migrate deploy

Write-Host "`n✅ Database setup complete!`n" -ForegroundColor Green
```

**Run it:**
```powershell
cd C:\Bhavin\CloudPA.io\apps\api
.\setup-prod-db.ps1
```

---

## 🔍 Verify Connection

Test the connection:

```powershell
cd C:\Bhavin\CloudPA.io\apps\api
$env:DATABASE_URL = "postgresql://doadmin:[YOUR_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
npx prisma db pull
```

---

## 📊 Next Steps (After Database Setup)

1. **Set up Redis** (if using BullMQ fallback)
   - Create Redis database in DigitalOcean
   - Get connection string
   - Set `REDIS_URL` environment variable

2. **Configure Twilio**
   - Set `TWILIO_ACCOUNT_SID`
   - Set `TWILIO_AUTH_TOKEN`
   - Set `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886`

3. **Create ChatAccount Record**
   ```sql
   INSERT INTO "ChatAccount" (id, "orgId", provider, "externalPhoneId", "isActive", "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'your-org-id-here',
     'twilio_whatsapp',
     'whatsapp:+14155238886',
     true,
     NOW(),
     NOW()
   );
   ```

4. **Configure Twilio Webhook**
   - URL: `https://your-app.ondigitalocean.app/api/v1/messaging/webhook/whatsapp`
   - Method: POST

---

## 🔒 Security Notes

- ✅ **Never commit** this file to GitHub
- ✅ **Use environment variables** in production
- ✅ **Rotate passwords** regularly
- ✅ **Use SSL** (already configured with `sslmode=require`)

---

## 📝 For DigitalOcean App Platform

When deploying to App Platform, set this as an environment variable:

**Key:** `DATABASE_URL`  
**Value:** `postgresql://doadmin:[YOUR_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require`  
**Type:** Secret (recommended)

---

## 🆘 Troubleshooting

### Connection Refused
- Check firewall rules in DigitalOcean
- Verify database is running
- Check SSL certificate

### Migration Fails
- Ensure database is empty or compatible
- Check Prisma schema matches migrations
- Verify connection string is correct

### SSL Error
- Ensure `?sslmode=require` is in connection string
- Check DigitalOcean database SSL settings

---

**Ready to proceed?** Run the setup script or follow the steps manually!

