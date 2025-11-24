# 🔗 Connect GitHub Repository to DigitalOcean App Platform

## ✅ Prerequisites

- [x] **Code pushed to GitHub** - https://github.com/agajabhavin/cloudpa
- [x] **PostgreSQL database created** - `cloudpa-db` (PostgreSQL 16)
- [x] **Database credentials** - Saved and tested
- [ ] **DigitalOcean account** - Created with payment method

---

## 🗄️ Step 1: Setup Production Database

### 1.1 Connect and Verify Database

**Run the setup script:**
```powershell
cd C:\Bhavin\CloudPA.io\Github Migration
.\setup-production-database.ps1
```

**Or manually:**
```powershell
cd C:\Bhavin\CloudPA.io\apps\api
$env:DATABASE_URL = "postgresql://doadmin:[YOUR_DATABASE_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
npx prisma generate
npx prisma migrate deploy
```

**Verify:**
- [ ] Database connection successful
- [ ] Migrations applied
- [ ] All tables created
- [ ] Schema matches localhost

---

## 🔗 Step 2: Connect GitHub to App Platform

### 2.1 Create App in DigitalOcean

1. **Go to:** https://cloud.digitalocean.com/apps
2. **Click:** "Create App"
3. **Select:** "GitHub" as source
4. **Authorize DigitalOcean** (if first time)
   - Click "Authorize DigitalOcean"
   - Grant access to your GitHub account
   - Select repository access (or all repos)

### 2.2 Select Repository

1. **Repository:** Select `agajabhavin/cloudpa`
2. **Branch:** Select `main`
3. **Auto-deploy:** Enable (optional - deploys on every push)
4. **Click:** "Next"

### 2.3 Configure App Structure

**App Platform will auto-detect your monorepo structure.**

**Verify it detects:**
- ✅ `apps/api` - API service
- ✅ `apps/web` - Web service
- ✅ Monorepo structure

**If not auto-detected, manually configure:**

#### API Service:
- **Name:** `api`
- **Type:** Service
- **Source Directory:** `apps/api`
- **Build Command:** `cd apps/api && pnpm install && pnpm build`
- **Run Command:** `cd apps/api && pnpm start`
- **HTTP Port:** `3001`

#### Web Service:
- **Name:** `web`
- **Type:** Service
- **Source Directory:** `apps/web`
- **Build Command:** `cd apps/web && pnpm install && pnpm build`
- **Run Command:** `cd apps/web && pnpm start`
- **HTTP Port:** `3000`

#### Worker:
- **Name:** `inbound-worker`
- **Type:** Worker
- **Source Directory:** `apps/api`
- **Build Command:** `cd apps/api && pnpm install && pnpm build`
- **Run Command:** `cd apps/api && pnpm worker:inbound:prod`

**Click:** "Next"

---

## 🔧 Step 3: Configure Resources

### 3.1 Link PostgreSQL Database

**Option 1: Link Existing Database (Recommended)**

1. **In App Platform → Resources:**
   - Click "Add Database"
   - Select "Link Existing Database"
   - Choose your `cloudpa-db` database
   - **Note:** This auto-injects `DATABASE_URL` as `${db.DATABASE_URL}`

**Option 2: Use Manual Connection String**

If linking doesn't work, manually set:
- **Key:** `DATABASE_URL`
- **Value:** `postgresql://doadmin:[YOUR_DATABASE_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require`
- **Type:** Secret

- [ ] **Database linked or connection string set**

### 3.2 Skip Redis (Not Needed)

- [ ] **Redis:** Skip this step (not required for pg-boss)

---

## 🔐 Step 4: Set Environment Variables

**Go to:** App Platform → Settings → App-Level Environment Variables

### Required Variables:

```env
# Database (if not auto-injected)
DATABASE_URL=postgresql://doadmin:[YOUR_DATABASE_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# URLs
PUBLIC_BASE_URL=${APP_URL}
FRONTEND_URL=${APP_URL}

# Worker
QUEUE_TYPE=pgboss
INGEST_CONCURRENCY=15

# JWT
JWT_SECRET=your-strong-secret-key-change-this-in-production
```

**Mark as Secrets:**
- [ ] `TWILIO_AUTH_TOKEN` (click "Encrypt" or mark as Secret)
- [ ] `JWT_SECRET` (click "Encrypt" or mark as Secret)
- [ ] `DATABASE_URL` (if manually set, mark as Secret)

**Important Notes:**
- `${APP_URL}` is auto-set by App Platform
- Use your actual Twilio credentials
- Generate a strong `JWT_SECRET` (use a password generator)

- [ ] **All environment variables set**
- [ ] **Secrets marked as encrypted**

---

## 🚀 Step 5: Review and Deploy

### 5.1 Review Configuration

**Check:**
- [ ] All services configured correctly
- [ ] Database linked or connection string set
- [ ] Environment variables configured
- [ ] Build commands correct
- [ ] Run commands correct

### 5.2 Deploy

1. **Click:** "Create Resources" or "Deploy"
2. **Wait for build** (5-10 minutes)
3. **Monitor build logs** for any errors

**Expected Build Steps:**
1. Installing dependencies (`pnpm install`)
2. Building API (`pnpm build` in `apps/api`)
3. Building Web (`pnpm build` in `apps/web`)
4. Starting services

---

## ✅ Step 6: Post-Deployment Verification

### 6.1 Check Deployment Status

- [ ] **API service:** Running (green status)
- [ ] **Web service:** Running (green status)
- [ ] **Worker:** Running (green status)

### 6.2 Get App URLs

**From App Platform dashboard:**
- **API URL:** `https://your-api-xxxxx.ondigitalocean.app`
- **Web URL:** `https://your-web-xxxxx.ondigitalocean.app`

### 6.3 Test API

```powershell
# Health check
curl https://your-api-xxxxx.ondigitalocean.app/api/v1/auth/me

# Should return 401 (not authenticated) - this is correct!
```

- [ ] **API responds** (even if 401)

### 6.4 Test Web

- [ ] **Web app loads** in browser
- [ ] **Homepage accessible**
- [ ] **Login page accessible**

### 6.5 Check Worker Logs

**In App Platform → Runtime Logs → Worker:**
- [ ] **Worker started** (look for "✅ Inbound message worker(s) started")
- [ ] **No errors** in logs
- [ ] **pg-boss connected** (if using pg-boss)

---

## 🔧 Step 7: Run Migrations (If Needed)

**If migrations weren't run during setup:**

### Option 1: Via App Platform Console

1. **Go to:** App Platform → Console
2. **Select:** API service
3. **Run:**
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```

### Option 2: Via Local Connection

```powershell
cd C:\Bhavin\CloudPA.io\apps\api
$env:DATABASE_URL = "postgresql://doadmin:[YOUR_DATABASE_PASSWORD]@db-postgresql-lon1-08114-do-user-19117823-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
npx prisma migrate deploy
```

- [ ] **Migrations applied**

---

## 📱 Step 8: Configure Twilio Webhook

1. **Get your API URL** from App Platform
2. **Go to:** https://console.twilio.com/us1/develop/sms/sandbox
3. **Set webhook URL:** `https://your-api-xxxxx.ondigitalocean.app/api/v1/messaging/webhook/whatsapp`
4. **Method:** POST
5. **Save**

- [ ] **Webhook configured**

---

## 🧪 Step 9: End-to-End Test

1. **Send WhatsApp message** to `+1 415 523 8886`
2. **Check API logs** for webhook receipt
3. **Check worker logs** for job processing
4. **Check database** for new conversation
5. **Check web UI** for conversation

- [ ] **End-to-end test successful**

---

## ✅ Deployment Complete!

**Your app is now:**
- ✅ Connected to GitHub
- ✅ Deployed to DigitalOcean
- ✅ Database connected
- ✅ Worker running
- ✅ Ready for production use!

---

## 🆘 Troubleshooting

### Build Fails
- Check build logs for errors
- Verify `package.json` scripts are correct
- Ensure all dependencies are in `package.json`

### Database Connection Fails
- Verify `DATABASE_URL` is set correctly
- Check firewall rules allow App Platform IPs
- Verify SSL is enabled (`sslmode=require`)

### Worker Won't Start
- Check `worker:inbound:prod` script exists
- Verify `dist/messaging/inbound.worker.js` is built
- Check environment variables are set

### Services Not Accessible
- Check service status in App Platform
- Verify ports are correct (3001 for API, 3000 for Web)
- Check firewall rules

---

**Ready to connect?** Follow the steps above! 🚀

