# Twilio WhatsApp Integration Setup Guide

## Overview
This guide covers the end-to-end Twilio WhatsApp Sandbox integration for Cloud PA, designed for individual freelancers with a simple, user-friendly UI.

## ✅ Completed Implementation

### 1. Environment Variables
Created `apps/api/.env.example` with:
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token  
- `TWILIO_WHATSAPP_FROM` - Sandbox number (default: `whatsapp:+14155238886`)
- `PUBLIC_BASE_URL` - Your public URL for webhook (e.g., `http://localhost:3001` or your ngrok URL)
- `INGEST_CONCURRENCY` - Worker concurrency (default: 15)

### 2. Database Schema
**Migration Applied:** `20251123211655_add_chat_account`

**SQL Changes:**
```sql
-- Added ChatAccount table
CREATE TABLE "ChatAccount" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalPhoneId" TEXT NOT NULL,
    "accountSid" TEXT,
    "authToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChatAccount_pkey" PRIMARY KEY ("id")
);

-- Indexes for fast lookups
CREATE INDEX "ChatAccount_orgId_provider_idx" ON "ChatAccount"("orgId", "provider");
CREATE INDEX "ChatAccount_provider_externalPhoneId_idx" ON "ChatAccount"("provider", "externalPhoneId");
CREATE UNIQUE INDEX "ChatAccount_orgId_provider_externalPhoneId_key" ON "ChatAccount"("orgId", "provider", "externalPhoneId");

-- Message indexes (already existed, verified)
CREATE INDEX "Message_orgId_sentAt_idx" ON "Message"("orgId", "sentAt");
CREATE INDEX "Message_conversationId_sentAt_idx" ON "Message"("conversationId", "sentAt");
```

**Note:** Contact already has `@@unique([orgId, handle])` constraint.

### 3. Backend Implementation

#### Queue & Worker (`apps/api/src/messaging/`)
- ✅ `queue.ts` - BullMQ queue for inbound messages
- ✅ `inbound.worker.ts` - Worker processes Twilio webhook payloads:
  - Extracts `From` (customer handle), `Body` (text), `Timestamp`
  - Upserts Contact by (orgId, handle)
  - Creates/updates Conversation
  - Inserts Message with denormalized orgId
  - Updates conversation.lastMessageAt
  - Concurrency: `INGEST_CONCURRENCY` env var (default 15)

#### Webhook Controller (`apps/api/src/messaging/messaging.controller.ts`)
- ✅ `POST /api/v1/messaging/webhook/whatsapp`
  - Verifies Twilio signature using `twilio.validateRequest()`
  - Resolves org from `body.To` number via `ChatAccount` lookup
  - Enqueues job to `inboundQueue`
  - Returns 200 quickly (< 100ms)

#### Twilio Provider (`apps/api/src/messaging/providers/twilio-whatsapp.provider.ts`)
- ✅ `sendMessage(orgId, to, text)` - Sends WhatsApp messages via Twilio
  - Uses ChatAccount credentials or falls back to env vars
  - Handles WhatsApp format (`whatsapp:+1234567890`)
  - Respects 24-hour sandbox session (no templates needed for replies)

#### Messaging Service Updates
- ✅ `resolveOrgFromToNumber(to)` - Helper to find org from Twilio number
- ✅ `send()` - Updated to use Twilio provider instead of placeholder adapter

### 4. UI Updates (`apps/web/src/app/(app)/inbox/`)
- ✅ Inbox page loads real conversations from `/messaging/conversations`
- ✅ Empty state shows webhook URL for setup
- ✅ Conversation page loads messages and allows replies
- ✅ Reply posts to `/messaging/conversations/:id/send`

## 🚀 Setup Steps

### Step 1: Configure Environment Variables
Copy `.env.example` to `.env` in `apps/api/` and fill in:
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
PUBLIC_BASE_URL=http://localhost:3001  # Or your ngrok URL for testing
```

### Step 2: Create ChatAccount Record
For sandbox testing, create a ChatAccount record for your organization:

```typescript
// Via Prisma Studio or API
await prisma.chatAccount.create({
  data: {
    orgId: "your-org-id",
    provider: "twilio_whatsapp",
    externalPhoneId: "whatsapp:+14155238886", // Your Twilio sandbox number
    accountSid: process.env.TWILIO_ACCOUNT_SID, // Optional, can use env
    authToken: process.env.TWILIO_AUTH_TOKEN,   // Optional, can use env
    isActive: true,
  },
});
```

### Step 3: Configure Twilio Webhook
1. Go to Twilio Console → WhatsApp Sandbox
2. Set webhook URL to: `https://your-domain.com/api/v1/messaging/webhook/whatsapp`
3. For local testing, use ngrok: `ngrok http 3001`
4. Set webhook to: `https://your-ngrok-url.ngrok.io/api/v1/messaging/webhook/whatsapp`

### Step 4: Start Services
```bash
# Terminal 1: API Server
cd apps/api
pnpm dev

# Terminal 2: Inbound Worker
cd apps/api
pnpm build
pnpm worker:inbound

# Terminal 3: Web App (if not already running)
cd apps/web
pnpm dev
```

### Step 5: Test
1. Send a WhatsApp message to your Twilio sandbox number from your phone
2. Join the sandbox by sending the code Twilio provides
3. Send a test message
4. Check the inbox in the web app - conversation should appear
5. Reply from the UI - message should be sent via Twilio

## 📋 API Endpoints

### Webhook (Public)
- `POST /api/v1/messaging/webhook/whatsapp` - Twilio webhook endpoint

### Conversations (Authenticated)
- `GET /api/v1/messaging/conversations` - List conversations
- `GET /api/v1/messaging/conversations/:id` - Get conversation with messages
- `POST /api/v1/messaging/conversations/:id/send` - Send reply

## 🔧 Worker Script
Added to `package.json`:
```json
"worker:inbound": "node dist/messaging/inbound.worker.js"
```

Run after building: `pnpm build && pnpm worker:inbound`

## 📝 Notes

1. **Sandbox Limitations:**
   - Can only reply within 24 hours of customer's last message
   - No templates needed for replies (only for outbound to new numbers)
   - Sandbox number: `+14155238886`

2. **Org Resolution:**
   - Webhook resolves org from `body.To` (your Twilio number)
   - Looks up `ChatAccount` where `provider="twilio_whatsapp"` and `externalPhoneId == body.To`
   - Falls back to env vars if ChatAccount not found (for testing)

3. **Message Format:**
   - Twilio sends: `From` (whatsapp:+1234567890), `Body` (text), `Timestamp` (Unix seconds)
   - Worker extracts and normalizes to Contact handle and Message text

4. **Error Handling:**
   - Invalid signatures return 400
   - Missing org returns error (can be configured to use default for testing)
   - Worker failures are logged but don't crash the queue

## 🎯 Next Steps (Future Enhancements)
- [ ] Add ChatAccount management UI
- [ ] Support multiple WhatsApp numbers per org
- [ ] Add message status callbacks (delivered, read)
- [ ] Support media messages (images, files)
- [ ] Add webhook retry logic
- [ ] Production Twilio number setup

