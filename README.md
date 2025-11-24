# CloudPA - Micro CRM with WhatsApp Integration

A modern, enterprise-grade CRM platform built for freelancers and small businesses, featuring WhatsApp messaging integration, lead management, and quote generation.

## 🚀 Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** NestJS, Prisma ORM
- **Database:** PostgreSQL
- **Queue System:** pg-boss (primary), BullMQ + Redis (fallback)
- **Messaging:** Twilio WhatsApp
- **Deployment:** DigitalOcean App Platform

## 📦 Project Structure

```
├── apps/
│   ├── api/          # NestJS backend API
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Shared TypeScript types
└── infra/            # Infrastructure configs
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+
- Redis (optional, for BullMQ fallback)

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your credentials

# Run database migrations
cd apps/api
pnpm prisma migrate deploy

# Start development servers
pnpm dev
```

## 🔧 Environment Variables

See `apps/api/.env.example` for required environment variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `TWILIO_ACCOUNT_SID` - Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- `TWILIO_WHATSAPP_FROM` - Twilio WhatsApp number
- `PUBLIC_BASE_URL` - Public URL for webhooks

## 📚 Documentation

- **Deployment:** See `DEPLOY_TO_DIGITALOCEAN.md` for production deployment
- **Twilio Setup:** See `TWILIO_SETUP.md` for WhatsApp integration
- **Quick Start:** See `QUICK_START.md` for detailed setup

## 🚢 Deployment

This project is configured for DigitalOcean App Platform. See `apps/api/app-platform.yaml` for configuration.

**Quick Deploy:**
1. Connect this repository to DigitalOcean App Platform
2. Set environment variables in App Platform dashboard
3. Deploy!

## 📝 License

Private - All rights reserved

## 🤝 Support

For setup and deployment questions, refer to the documentation files in this repository.
