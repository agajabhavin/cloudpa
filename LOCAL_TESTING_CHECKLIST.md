# 🧪 Local Testing Checklist - Before Deployment

**Test everything locally first to ensure smooth deployment!**

---

## ✅ Pre-Testing Setup

### Step 1: Verify Local Database

- [ ] **PostgreSQL running locally** (or connected to test database)
- [ ] **Database version:** PostgreSQL 15 or 16 (matches production)
- [ ] **Connection string configured** in `apps/api/.env`

**Test connection:**
```powershell
cd apps/api
npx prisma db pull
```

### Step 2: Verify Environment Variables

**Check `apps/api/.env` has:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/cloudpa
JWT_SECRET=your-local-secret-key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
PUBLIC_BASE_URL=http://localhost:3001
QUEUE_TYPE=pgboss
INGEST_CONCURRENCY=15
```

**Optional (for BullMQ testing):**
```env
REDIS_URL=redis://localhost:6379
```

- [ ] **All required variables set**
- [ ] **Values are correct**

---

## 🗄️ Database Testing

### Step 3: Run Migrations

```powershell
cd apps/api
npx prisma generate
npx prisma migrate deploy
```

- [ ] **Prisma Client generated** (no errors)
- [ ] **Migrations applied** (all migrations successful)
- [ ] **No migration errors**

### Step 4: Verify Database Schema

```powershell
cd apps/api
pnpm migrate:verify
```

**Or manually check:**
```powershell
npx prisma studio
```

- [ ] **All tables created:**
  - [ ] `Org`
  - [ ] `User`
  - [ ] `OrgUser`
  - [ ] `Contact`
  - [ ] `Conversation`
  - [ ] `Message`
  - [ ] `ChatAccount`
  - [ ] `Lead`
  - [ ] `Quote`
  - [ ] `QuoteItem`

- [ ] **Indexes created** (check for `orgId`, `conversationId` indexes)
- [ ] **Constraints created** (check for unique constraints)

### Step 5: Test pg-boss Schema

**pg-boss creates its own schema automatically. Verify:**

```sql
-- Connect to database
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'pgboss';
```

- [ ] **pg-boss schema exists** (or will be created on first use)

---

## 🚀 Application Testing

### Step 6: Build Application

```powershell
# From root
pnpm build
```

- [ ] **API builds successfully** (no TypeScript errors)
- [ ] **Web builds successfully** (no TypeScript errors)
- [ ] **Worker file exists:** `apps/api/dist/messaging/inbound.worker.js`

### Step 7: Start API Server

```powershell
cd apps/api
pnpm start
```

**Or in development:**
```powershell
pnpm dev
```

**Test endpoints:**
```powershell
# Health check
curl http://localhost:3001/api/v1/auth/me

# Should return 401 (not authenticated) - this is correct!
```

- [ ] **API starts without errors**
- [ ] **Port 3001 accessible**
- [ ] **No database connection errors**
- [ ] **Routes accessible** (even if 401/404)

### Step 8: Start Web Server

```powershell
cd apps/web
pnpm dev
```

**Or in production:**
```powershell
pnpm start
```

- [ ] **Web starts without errors**
- [ ] **Port 3000 accessible**
- [ ] **Homepage loads**
- [ ] **Login page accessible**

### Step 9: Test Worker

```powershell
cd apps/api
pnpm worker:inbound
```

**Expected output:**
```
🚀 Starting workers (QUEUE_TYPE=pgboss, CONCURRENCY=15)
✅ pg-boss worker started (primary) - 15 concurrent workers
✅ Inbound message worker(s) started
```

- [ ] **Worker starts successfully**
- [ ] **pg-boss connects** (or BullMQ if Redis available)
- [ ] **No connection errors**
- [ ] **Workers initialized**

**Stop worker:** `Ctrl+C`

---

## 🔄 Queue System Testing

### Step 10: Test pg-boss Queue (Primary)

**With `QUEUE_TYPE=pgboss` or `auto`:**

1. **Start worker:**
   ```powershell
   cd apps/api
   $env:QUEUE_TYPE="pgboss"
   pnpm worker:inbound
   ```

2. **In another terminal, test enqueue:**
   ```powershell
   cd apps/api
   # Use Prisma Studio or API to create a test message
   # Or use the webhook endpoint
   ```

- [ ] **pg-boss initializes** (no errors)
- [ ] **Jobs can be enqueued**
- [ ] **Jobs are processed** (check worker logs)

### Step 11: Test BullMQ Queue (Optional - Only if Redis available)

**If you have Redis running:**

1. **Set environment:**
   ```powershell
   $env:REDIS_URL="redis://localhost:6379"
   $env:QUEUE_TYPE="bullmq"
   ```

2. **Start worker:**
   ```powershell
   pnpm worker:inbound
   ```

- [ ] **BullMQ connects** (no errors)
- [ ] **Jobs can be enqueued**
- [ ] **Jobs are processed**

**Note:** If Redis is not available, this test will fail - that's OK! pg-boss works without Redis.

---

## 📱 Twilio Integration Testing

### Step 12: Test Webhook Endpoint

**Start ngrok (for local testing):**
```powershell
ngrok http 3001
```

**Update Twilio webhook URL:**
- URL: `https://your-ngrok-url.ngrok.io/api/v1/messaging/webhook/whatsapp`
- Method: POST

**Send test WhatsApp message:**
- To: `+1 415 523 8886`
- Message: "Hello CloudPA"

- [ ] **Webhook receives request** (check API logs)
- [ ] **Signature verification passes**
- [ ] **Job enqueued** (check queue logs)
- [ ] **Worker processes message** (check worker logs)
- [ ] **Contact created** (check database)
- [ ] **Conversation created** (check database)
- [ ] **Message saved** (check database)

### Step 13: Test Outbound Messaging

**Via API or UI:**
```powershell
POST http://localhost:3001/api/v1/messaging/conversations/:id/send
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "text": "Test reply from CloudPA"
}
```

- [ ] **Message sent successfully**
- [ ] **Received in WhatsApp**
- [ ] **Message saved to database**

---

## 🎨 UI Testing

### Step 14: Test User Authentication

- [ ] **Sign up works**
- [ ] **Login works**
- [ ] **JWT token received**
- [ ] **Protected routes accessible**

### Step 15: Test Inbox

- [ ] **Conversations load**
- [ ] **Messages display**
- [ ] **Reply box works**
- [ ] **Messages send successfully**

### Step 16: Test Other Pages

- [ ] **Dashboard loads**
- [ ] **Leads page works**
- [ ] **Quotes page works**
- [ ] **Settings page works**

---

## ✅ Final Verification

### Step 17: Production Database Connection Test

**Test connection to production database:**

```powershell
cd apps/api
$env:DATABASE_URL = "postgresql://doadmin:[YOUR_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
npx prisma db pull
```

- [ ] **Connection successful**
- [ ] **Can read schema**
- [ ] **SSL works**

### Step 18: Production Migrations Test

**Run migrations against production database:**

```powershell
cd apps/api
$env:DATABASE_URL = "postgresql://doadmin:[YOUR_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
npx prisma migrate deploy
```

- [ ] **Migrations run successfully**
- [ ] **No errors**
- [ ] **Schema matches local**

---

## 📋 Pre-Deployment Checklist

Before deploying to DigitalOcean:

- [ ] **All local tests pass**
- [ ] **Production database accessible**
- [ ] **Migrations tested on production database**
- [ ] **Build works** (`pnpm build`)
- [ ] **Worker script works** (`pnpm worker:inbound:prod`)
- [ ] **Environment variables documented**
- [ ] **Code pushed to GitHub**
- [ ] **No secrets in code** (check `.gitignore`)

---

## 🆘 Common Issues

### Database Connection Fails
- Check firewall rules
- Verify SSL is enabled
- Check credentials

### Migrations Fail
- Ensure database is empty or compatible
- Check Prisma schema matches migrations
- Verify PostgreSQL version (15 or 16)

### Worker Won't Start
- Check `QUEUE_TYPE` environment variable
- Verify `DATABASE_URL` is set
- Check pg-boss can connect

### Build Fails
- Run `pnpm install` first
- Check TypeScript errors
- Verify all dependencies installed

---

## ✅ Ready for Deployment?

Once all tests pass, you're ready to deploy! 🚀

Follow `DEPLOYMENT_CHECKLIST.md` for deployment steps.

