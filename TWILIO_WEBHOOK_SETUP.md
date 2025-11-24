# 🔗 Twilio Webhook Configuration Guide

## 📋 Current Status

✅ **Sandbox Number:** `+1 415 523 8886`  
✅ **Join Code:** `join split-protection.`  
✅ **Participants:** 1  
⚠️ **Webhook URL:** Needs to be updated

---

## 🔧 Step-by-Step Configuration

### Step 1: Start ngrok

**If ngrok is not running:**

1. **Install ngrok** (if not installed):
   - Download: https://ngrok.com/download
   - Or: `choco install ngrok` (Windows)

2. **Start ngrok** in a new terminal:
   ```bash
   ngrok http 3001
   ```

3. **Copy the HTTPS URL:**
   - Look for: `Forwarding https://abc123.ngrok.io -> http://localhost:3001`
   - Copy the `https://abc123.ngrok.io` part (your URL will be different)

### Step 2: Update Twilio Webhook URL

**In Twilio Console (where you are now):**

1. **Find "When a message comes in" field**
   - Currently shows: `https://timberwolf-mastiff-9776.twil.io/demo-reply`

2. **Replace with your ngrok URL:**
   ```
   https://YOUR-NGROK-URL.ngrok.io/api/v1/messaging/webhook/whatsapp
   ```
   
   **Example:**
   ```
   https://abc123.ngrok.io/api/v1/messaging/webhook/whatsapp
   ```

3. **Verify Method:**
   - Should be set to **POST** ✅ (already correct)

4. **Click "Save" button**

### Step 3: Verify Configuration

**After saving:**

1. **Check API server is running:**
   ```bash
   cd apps/api
   pnpm dev
   ```
   Should show: `API running on http://localhost:3001`

2. **Check worker is running:**
   ```bash
   cd apps/api
   pnpm worker:inbound
   ```
   Should show: `Inbound message worker started`

3. **Test webhook:**
   - Send a WhatsApp message to `+1 415 523 8886`
   - Check API server logs for: `POST /api/v1/messaging/webhook/whatsapp`
   - Check worker logs for: `Job <id> completed`

---

## 📝 Important Notes

### Webhook URL Format

**Correct Format:**
```
https://YOUR-NGROK-URL.ngrok.io/api/v1/messaging/webhook/whatsapp
```

**Components:**
- `https://` - Protocol (required for ngrok)
- `YOUR-NGROK-URL.ngrok.io` - Your ngrok HTTPS URL
- `/api/v1/messaging/webhook/whatsapp` - Your API endpoint

### Method

- **Must be:** `POST`
- ✅ Already set correctly in your console

### ngrok URL Changes

**Important:** ngrok URLs change every time you restart ngrok (on free tier).

**If you restart ngrok:**
1. Get new URL
2. Update Twilio webhook URL again
3. Save

**For production:** Use a static domain or DigitalOcean App Platform URL.

---

## 🧪 Testing the Webhook

### Test 1: Send Message

1. **From WhatsApp:**
   - Send message to: `+1 415 523 8886`
   - Example: "Hello, I need a quote"

2. **Check API Server Logs:**
   ```
   POST /api/v1/messaging/webhook/whatsapp 200
   ```

3. **Check Worker Logs:**
   ```
   Job <id> completed
   ```

4. **Check Inbox UI:**
   - Open: `http://localhost:3000/inbox`
   - Conversation should appear

### Test 2: Verify Webhook Delivery

**In Twilio Console:**
1. Go to **Monitor** → **Logs** → **Messaging**
2. Click on your message
3. Check **"Webhook"** section
4. Should show: `200 OK` status

---

## 🔍 Troubleshooting

### Webhook Not Receiving Messages

**Check:**
1. ✅ ngrok is running (`ngrok http 3001`)
2. ✅ API server is running (`pnpm dev`)
3. ✅ Webhook URL matches ngrok URL exactly
4. ✅ Method is POST
5. ✅ URL ends with `/api/v1/messaging/webhook/whatsapp`

**Common Issues:**
- **404 Not Found:** URL path incorrect
- **Connection Refused:** API server not running
- **Timeout:** ngrok tunnel not active

### Messages Not Processing

**Check:**
1. ✅ Worker is running (`pnpm worker:inbound`)
2. ✅ Redis connection working
3. ✅ ChatAccount exists in database
4. ✅ Check worker logs for errors

---

## ✅ Configuration Checklist

- [ ] ngrok installed and running
- [ ] ngrok HTTPS URL copied
- [ ] Twilio webhook URL updated
- [ ] Method set to POST
- [ ] "Save" button clicked
- [ ] API server running
- [ ] Worker running
- [ ] Test message sent
- [ ] Webhook received (check logs)
- [ ] Message processed (check worker logs)
- [ ] Conversation appears in inbox UI

---

## 🎯 Quick Reference

**Current Webhook URL (Wrong):**
```
https://timberwolf-mastiff-9776.twil.io/demo-reply
```

**New Webhook URL (Correct):**
```
https://YOUR-NGROK-URL.ngrok.io/api/v1/messaging/webhook/whatsapp
```

**Replace `YOUR-NGROK-URL` with your actual ngrok URL!**

---

## 🚀 After Configuration

Once webhook is configured:

1. **Send test message** from WhatsApp
2. **Verify webhook receives it** (check API logs)
3. **Verify worker processes it** (check worker logs)
4. **Check inbox UI** - conversation should appear
5. **Test reply** - send from UI, verify in WhatsApp

---

**Status:** Ready to configure webhook URL!

