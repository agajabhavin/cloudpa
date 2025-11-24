# ✅ DigitalOcean Deployment Checklist

## 📋 Pre-Deployment

- [x] **Database Created** - DigitalOcean PostgreSQL
- [x] **Database Credentials** - Saved (see PRODUCTION_DATABASE_SETUP.md)
- [x] **Code Pushed to GitHub** - https://github.com/agajabhavin/cloudpa
- [ ] **Redis Database** - Create in DigitalOcean (OPTIONAL - only if using BullMQ fallback)
- [ ] **Twilio Account** - Configured with sandbox

---

## 🗄️ Database Setup (COMPLETED)

### Your Database Details:
```
Host: db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com
Port: 25060
Database: defaultdb
User: doadmin
Password: [YOUR_DATABASE_PASSWORD]
SSL: Required
```

### Connection String:
```
postgresql://doadmin:[YOUR_DATABASE_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require
```

### Setup Steps:

1. **Run Database Migrations:**
   ```powershell
   cd C:\Bhavin\CloudPA.io\apps\api
   .\setup-prod-db.ps1
   ```

   Or manually:
   ```powershell
   $env:DATABASE_URL = "postgresql://doadmin:[YOUR_DATABASE_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
   npx prisma generate
   npx prisma migrate deploy
   ```

- [ ] **Migrations Run Successfully**
- [ ] **Database Schema Verified**

---

## 🚀 DigitalOcean App Platform Setup

### Step 1: Create App

- [ ] Go to: https://cloud.digitalocean.com/apps
- [ ] Click "Create App"
- [ ] Connect GitHub account
- [ ] Select repository: `agajabhavin/cloudpa`
- [ ] Select branch: `main`

### Step 2: Configure Services

#### API Service:
- [ ] **Name:** `api`
- [ ] **Type:** Service
- [ ] **Source:** `apps/api`
- [ ] **Build Command:** `cd apps/api && pnpm install && pnpm build`
- [ ] **Run Command:** `cd apps/api && pnpm start`
- [ ] **HTTP Port:** `3001`

#### Web Service:
- [ ] **Name:** `web`
- [ ] **Type:** Service
- [ ] **Source:** `apps/web`
- [ ] **Build Command:** `cd apps/web && pnpm install && pnpm build`
- [ ] **Run Command:** `cd apps/web && pnpm start`
- [ ] **HTTP Port:** `3000`

#### Worker:
- [ ] **Name:** `inbound-worker`
- [ ] **Type:** Worker
- [ ] **Source:** `apps/api`
- [ ] **Build Command:** `cd apps/api && pnpm install && pnpm build`
- [ ] **Run Command:** `cd apps/api && pnpm worker:inbound:prod`

### Step 3: Link Databases

- [ ] **Link PostgreSQL:**
  - In App Platform → Components → Databases
  - Click "Add Database"
  - Select your existing database OR create new
  - **Note:** If using existing, manually set `DATABASE_URL` env var

- [ ] **Link Redis (OPTIONAL - Skip if using pg-boss only):**
  - Create Redis database in DigitalOcean (only if you want BullMQ fallback)
  - Link to App Platform
  - Auto-injects `REDIS_URL`
  - **Recommended:** Skip this and use pg-boss only (saves $15/month)

### Step 4: Set Environment Variables

**App-Level Environment Variables:**

```env
# Database (if not auto-injected)
DATABASE_URL=postgresql://doadmin:[YOUR_DATABASE_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require

# Redis (OPTIONAL - only if using BullMQ fallback)
# REDIS_URL=${redis.REDIS_URL}  # Uncomment if using Redis

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# URLs
PUBLIC_BASE_URL=${APP_URL}
FRONTEND_URL=${APP_URL}

# Worker
QUEUE_TYPE=pgboss  # Use 'pgboss' (recommended), 'bullmq', or 'auto'
INGEST_CONCURRENCY=15

# JWT
JWT_SECRET=your-strong-secret-key-change-this
```

**Set as Secrets:**
- [ ] `TWILIO_AUTH_TOKEN` (mark as Secret)
- [ ] `JWT_SECRET` (mark as Secret)
- [ ] `DATABASE_URL` (mark as Secret, if manually set)

---

## 🧪 Post-Deployment

### Step 5: Verify Deployment

- [ ] **API Health Check:**
  ```bash
  curl https://your-api.ondigitalocean.app/api/v1/auth/me
  ```

- [ ] **Web App Accessible:**
  ```bash
  curl https://your-web.ondigitalocean.app
  ```

- [ ] **Worker Running:**
  - Check App Platform logs for worker
  - Should see: "✅ Inbound message worker(s) started"

### Step 6: Create ChatAccount

**Option 1: Via API (Recommended)**
```bash
POST https://your-api.ondigitalocean.app/api/v1/org/chat-accounts
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "provider": "twilio_whatsapp",
  "externalPhoneId": "whatsapp:+14155238886"
}
```

**Option 2: Via Prisma Studio**
```powershell
cd C:\Bhavin\CloudPA.io\apps\api
$env:DATABASE_URL = "postgresql://doadmin:[YOUR_DATABASE_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
npx prisma studio
```

- [ ] **ChatAccount Created**

### Step 7: Configure Twilio Webhook

- [ ] Go to: https://console.twilio.com/us1/develop/sms/sandbox
- [ ] Set webhook URL: `https://your-api.ondigitalocean.app/api/v1/messaging/webhook/whatsapp`
- [ ] Method: POST
- [ ] Save

- [ ] **Webhook Configured**

### Step 8: Test End-to-End

- [ ] **Send Test WhatsApp Message:**
  - Send to: `+1 415 523 8886`
  - Message: "Hello CloudPA"

- [ ] **Check Webhook Received:**
  - Check API logs in App Platform
  - Should see webhook request

- [ ] **Check Worker Processing:**
  - Check worker logs
  - Should see job processing

- [ ] **Check UI:**
  - Login to web app
  - Go to Inbox
  - Conversation should appear

- [ ] **Test Reply:**
  - Reply to conversation in UI
  - Check WhatsApp for reply

---

## ✅ Final Verification

- [ ] All services running
- [ ] Database connected
- [ ] Migrations applied
- [ ] ChatAccount created
- [ ] Twilio webhook configured
- [ ] Inbound messages working
- [ ] Outbound messages working
- [ ] UI displaying conversations

---

## 📝 Notes

- **Database:** Already created and configured
- **Connection String:** Saved in PRODUCTION_DATABASE_SETUP.md
- **Migrations:** Run locally before or after deployment
- **Redis:** Optional (pg-boss works without it)
- **Queue Type:** Set to `auto` (uses pg-boss if available, falls back to BullMQ)

---

## 🆘 Troubleshooting

### Database Connection Issues
- Verify firewall rules allow App Platform IPs
- Check SSL is enabled (`sslmode=require`)
- Verify credentials are correct

### Worker Not Starting
- Check `worker:inbound:prod` script exists
- Verify `dist/messaging/inbound.worker.js` is built
- Check environment variables are set

### Webhook Not Receiving
- Verify webhook URL is correct
- Check Twilio signature verification
- Review API logs for errors

---

**Ready to deploy?** Follow the steps above! 🚀

