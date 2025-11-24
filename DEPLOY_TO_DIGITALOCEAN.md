# 🚀 Deploy to DigitalOcean App Platform - Complete Guide

## ✅ Why Deploy Now?

**Benefits:**
- ✅ **No ngrok needed** - Real public URL
- ✅ **Production-like testing** - Test in actual environment
- ✅ **Twilio webhook works directly** - No tunnel needed
- ✅ **Closer to production** - Same setup as final deployment

---

## 📋 Pre-Deployment Checklist

### ✅ Step 1: Verify Code is Ready

- [x] All TypeScript errors fixed
- [x] Build passes: `pnpm build`
- [x] Worker script configured
- [x] Environment variables documented
- [x] Database migrations ready

### ✅ Step 2: Prepare Environment Variables

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection
- `TWILIO_ACCOUNT_SID` - Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- `TWILIO_WHATSAPP_FROM` - WhatsApp number
- `PUBLIC_BASE_URL` - Your app URL (auto-set by App Platform)
- `JWT_SECRET` - JWT secret key
- `INGEST_CONCURRENCY` - Worker concurrency (default: 15)
- `QUEUE_TYPE` - Queue system: `pgboss` (recommended), `bullmq`, or `auto`

**Optional Variables:**
- `REDIS_URL` - Redis connection (only if using BullMQ fallback)

---

## 🚀 Deployment Steps

### Step 1: Create DigitalOcean Account

1. **Sign up:** https://www.digitalocean.com/
2. **Verify email**
3. **Add payment method** (required for App Platform)

### Step 2: Create Managed Databases

#### 2.1 Create PostgreSQL Database

1. **Go to:** Databases → Create Database
2. **Select:** PostgreSQL
3. **Version:** PostgreSQL 16 (recommended) or 15
4. **Choose:** Development plan ($15/month) or Basic ($25/month)
5. **Region:** Same as your app
6. **Database Name:** `cloudpa-db`
7. **Create**

#### 2.2 Create Redis Database (OPTIONAL)

**⚠️ Redis is OPTIONAL!** 

The system uses **pg-boss** (PostgreSQL-based) as the primary queue system. Redis is only needed as a fallback for BullMQ.

**When to create Redis:**
- ✅ If you want a fallback queue system
- ✅ If you plan to use BullMQ exclusively
- ❌ **NOT required** if using pg-boss only (recommended)

**If you want Redis (optional):**

1. **Go to:** Databases → Create Database
2. **Select:** Redis
3. **Choose:** Development plan ($15/month)
4. **Region:** Same as your app
5. **Database Name:** `cloudpa-redis`
6. **Create**

**Note:** Wait for databases to be ready (5-10 minutes)

**Recommended:** Skip Redis and use pg-boss only (saves $15/month)

### Step 3: Push Code to GitHub

**If not already on GitHub:**

1. **Create GitHub repository:**
   ```bash
   cd C:\Bhavin\CloudPA.io
   git init
   git add .
   git commit -m "Initial commit - CloudPA with Twilio WhatsApp"
   ```

2. **Create repo on GitHub:**
   - Go to: https://github.com/new
   - Create repository (don't initialize with README)

3. **Push code:**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git branch -M main
   git push -u origin main
   ```

### Step 4: Deploy to App Platform

#### 4.1 Create App

1. **Go to:** App Platform → Create App
2. **Connect GitHub** (authorize DigitalOcean)
3. **Select your repository**
4. **Choose branch:** `main`
5. **Auto-deploy:** Enable (optional)

#### 4.2 Configure App Structure

**App Platform will detect:**
- Monorepo structure
- Multiple apps (api, web)

**Configure:**

1. **API Service:**
   - **Name:** `api`
   - **Type:** Service
   - **Source:** `apps/api`
   - **Build Command:** `cd apps/api && pnpm install && pnpm build`
   - **Run Command:** `cd apps/api && pnpm start`
   - **HTTP Port:** `3001`

2. **Web Service:**
   - **Name:** `web`
   - **Type:** Service
   - **Source:** `apps/web`
   - **Build Command:** `cd apps/web && pnpm install && pnpm build`
   - **Run Command:** `cd apps/web && pnpm start`
   - **HTTP Port:** `3000`

3. **Worker:**
   - **Name:** `inbound-worker`
   - **Type:** Worker
   - **Source:** `apps/api`
   - **Build Command:** `cd apps/api && pnpm install && pnpm build`
   - **Run Command:** `cd apps/api && pnpm worker:inbound:prod`
   - **Note:** Need to add `worker:inbound:prod` script

### Step 5: Link Databases

1. **Link PostgreSQL:**
   - In App Platform → Components → Databases
   - Click "Add Database"
   - Select `cloudpa-db`
   - App Platform auto-injects `DATABASE_URL`

2. **Link Redis:**
   - In App Platform → Components → Databases
   - Click "Add Database"
   - Select `cloudpa-redis`
   - App Platform auto-injects `REDIS_URL`

### Step 6: Configure Environment Variables

**In App Platform → Settings → App-Level Environment Variables:**

```env
# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
PUBLIC_BASE_URL=${APP_URL}  # Auto-set by App Platform

# Worker
INGEST_CONCURRENCY=15

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Database (Auto-injected when linked)
DATABASE_URL=${db.DATABASE_URL}
REDIS_URL=${redis.REDIS_URL}
```

**Set as Secrets:**
- `TWILIO_AUTH_TOKEN`
- `JWT_SECRET`

### Step 7: Run Database Migrations

**Option 1: Via App Platform Console**

1. **Go to:** App Platform → Console
2. **Run:**
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```

**Option 2: Via Local Connection**

1. **Get database connection string** from DigitalOcean
2. **Update local `.env`:**
   ```env
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```
3. **Run migration:**
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```

### Step 8: Create ChatAccount Record

**After deployment:**

1. **Get your app URL:** `https://your-app.ondigitalocean.app`
2. **Use API or script:**
   ```bash
   # Via API (after login)
   POST https://your-app.ondigitalocean.app/api/v1/org/chat-accounts
   {
     "provider": "twilio_whatsapp",
     "externalPhoneId": "whatsapp:+14155238886"
   }
   ```

   Or use Prisma Studio:
   ```bash
   # Connect to production database
   DATABASE_URL=your-prod-url pnpm prisma studio
   ```

### Step 9: Configure Twilio Webhook

1. **Get your app URL:**
   - From App Platform dashboard
   - Example: `https://cloudpa-api-abc123.ondigitalocean.app`

2. **Update Twilio Webhook:**
   - Go to Twilio Console → WhatsApp Sandbox
   - Set webhook URL: `https://your-app.ondigitalocean.app/api/v1/messaging/webhook/whatsapp`
   - Method: POST
   - Save

**No ngrok needed!** 🎉

---

## 🔧 Required Code Changes

### 1. Add Production Worker Script

**Update `apps/api/package.json`:**

```json
{
  "scripts": {
    "worker:inbound": "ts-node src/messaging/inbound.worker.ts",
    "worker:inbound:prod": "node dist/messaging/inbound.worker.js"
  }
}
```

**Note:** Need to ensure worker file is built and included in dist.

### 2. Update Worker Build

**Ensure worker is compiled:**

The worker needs to be in `dist/messaging/inbound.worker.js` after build.

**Check `tsconfig.json`** includes worker file.

### 3. Update PUBLIC_BASE_URL

**In App Platform:**
- Set `PUBLIC_BASE_URL=${APP_URL}`
- App Platform auto-sets `APP_URL` to your app's public URL

---

## 📊 App Platform Configuration (app.yaml)

**Create `app.yaml` in root:**

```yaml
name: cloudpa
region: nyc

services:
  - name: api
    github:
      repo: your-username/cloudpa
      branch: main
    source_dir: apps/api
    build_command: pnpm install && pnpm build
    run_command: pnpm start
    http_port: 3001
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: DATABASE_URL
        scope: RUN_TIME
        value: ${db.DATABASE_URL}
      - key: REDIS_URL
        scope: RUN_TIME
        value: ${redis.REDIS_URL}
      - key: TWILIO_ACCOUNT_SID
        scope: RUN_TIME
        type: SECRET
      - key: TWILIO_AUTH_TOKEN
        scope: RUN_TIME
        type: SECRET
      - key: TWILIO_WHATSAPP_FROM
        scope: RUN_TIME
        value: whatsapp:+14155238886
      - key: PUBLIC_BASE_URL
        scope: RUN_TIME
        value: ${APP_URL}
      - key: JWT_SECRET
        scope: RUN_TIME
        type: SECRET

  - name: web
    github:
      repo: your-username/cloudpa
      branch: main
    source_dir: apps/web
    build_command: pnpm install && pnpm build
    run_command: pnpm start
    http_port: 3000
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /

workers:
  - name: inbound-worker
    github:
      repo: your-username/cloudpa
      branch: main
    source_dir: apps/api
    build_command: pnpm install && pnpm build
    run_command: pnpm worker:inbound:prod
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: DATABASE_URL
        scope: RUN_TIME
        value: ${db.DATABASE_URL}
      - key: REDIS_URL
        scope: RUN_TIME
        value: ${redis.REDIS_URL}
      - key: INGEST_CONCURRENCY
        scope: RUN_TIME
        value: "15"

databases:
  - name: db
    engine: PG
    version: "15"
    production: false
  
  - name: redis
    engine: REDIS
    version: "7"
    production: false
```

---

## ✅ Post-Deployment Checklist

- [ ] App deployed successfully
- [ ] Databases linked
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] ChatAccount record created
- [ ] Twilio webhook configured
- [ ] Test message sent
- [ ] Webhook received
- [ ] Worker processed message
- [ ] Conversation appears in UI

---

## 🧪 Testing After Deployment

1. **Get your app URL:**
   - From App Platform dashboard
   - Example: `https://cloudpa-api-abc123.ondigitalocean.app`

2. **Test API:**
   ```bash
   curl https://your-app.ondigitalocean.app/api/v1/auth/me
   ```

3. **Test Webhook:**
   - Send WhatsApp message to `+1 415 523 8886`
   - Check App Platform logs for webhook receipt
   - Check worker logs for job processing

4. **Test UI:**
   - Open: `https://your-web-app.ondigitalocean.app/inbox`
   - Conversation should appear

---

## 💰 Cost Estimate

**Monthly Costs:**
- **App Platform (Basic):** ~$12/month (2 services + 1 worker)
- **PostgreSQL (Development):** $15/month
- **Redis (Development):** $15/month
- **Total:** ~$42/month

**Free Credits:**
- DigitalOcean often offers $200 free credits for new accounts
- Enough for ~4-5 months of testing

---

## 🎯 Next Steps

1. **Prepare code** (ensure builds work)
2. **Create DigitalOcean account**
3. **Create databases**
4. **Push code to GitHub**
5. **Deploy to App Platform**
6. **Configure environment variables**
7. **Run migrations**
8. **Create ChatAccount**
9. **Configure Twilio webhook**
10. **Test!**

---

**Ready to deploy?** Let's prepare the code first!

