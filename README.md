# 🐝 BoostHive — Social Media Marketing Platform

> **Powering Your Social Growth** — A production-ready, full-stack SMM panel built with Next.js 15, TypeScript, Tailwind CSS, PostgreSQL, Prisma, and Paystack.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Deployment (Vercel)](#deployment-vercel)
- [Default Credentials](#default-credentials)
- [API Reference](#api-reference)
- [SMM Provider Setup](#smm-provider-setup)
- [Paystack Setup](#paystack-setup)

---

## ✨ Features

### Client Features
- ✅ Register / Login / Forgot & Reset Password
- ✅ Email Verification
- ✅ Wallet funding via Paystack
- ✅ Browse & search services by category
- ✅ Place orders with auto price calculation
- ✅ Coupon code support
- ✅ Order history with status tracking
- ✅ Transaction ledger (credit/debit)
- ✅ Referral system with commission earnings
- ✅ Support ticket system with replies
- ✅ In-app notifications
- ✅ Dark/light mode
- ✅ Mobile-first responsive design

### Admin Features
- ✅ Full analytics dashboard with charts
- ✅ User management (suspend, credit, debit, delete)
- ✅ Order management (cancel, refund, complete)
- ✅ Service CRUD with category/provider linking
- ✅ Multi-provider SMM API management
- ✅ Provider balance checking
- ✅ Coupon code management
- ✅ Payment/transaction reporting
- ✅ Support ticket management with replies
- ✅ Configurable site settings

### Technical Features
- ✅ Automatic order submission to SMM providers
- ✅ Automatic order status sync (cron)
- ✅ Paystack webhook processing
- ✅ Email notifications (SMTP)
- ✅ Referral commission processing
- ✅ Audit logging
- ✅ JWT session management
- ✅ Rate limiting ready
- ✅ Sitemap & robots.txt
- ✅ Vercel-ready with cron jobs

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v5 (JWT) |
| Payments | Paystack |
| Email | Nodemailer (SMTP) |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 📁 Project Structure

```
boosthive/
├── prisma/
│   ├── schema.prisma          # Full database schema
│   └── seed.ts                # Seed data (admin, services, settings)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── forgot-password/   # Forgot password
│   │   ├── reset-password/    # Reset password
│   │   ├── verify-email/      # Email verification
│   │   ├── dashboard/         # Client dashboard (protected)
│   │   │   ├── page.tsx       # Overview
│   │   │   ├── orders/        # Order history
│   │   │   ├── services/      # New order
│   │   │   ├── wallet/        # Wallet & transactions
│   │   │   ├── referral/      # Referral program
│   │   │   ├── support/       # Tickets
│   │   │   ├── notifications/ # Notifications
│   │   │   └── profile/       # Profile settings
│   │   ├── admin/             # Admin panel (protected)
│   │   │   ├── page.tsx       # Analytics
│   │   │   ├── users/         # User management
│   │   │   ├── orders/        # Order management
│   │   │   ├── services/      # Service CRUD
│   │   │   ├── providers/     # SMM API providers
│   │   │   ├── payments/      # Transaction reports
│   │   │   ├── coupons/       # Coupon codes
│   │   │   ├── tickets/       # Support tickets
│   │   │   └── settings/      # Site settings
│   │   └── api/               # REST API routes
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   ├── admin/             # Admin components
│   │   ├── layout/            # Theme provider
│   │   └── ui/                # UI primitives (Toaster)
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma singleton
│   │   ├── email.ts           # Email templates
│   │   ├── paystack.ts        # Paystack integration
│   │   ├── smm-provider.ts    # SMM API client
│   │   └── utils.ts           # Utility functions
│   ├── middleware.ts           # Auth middleware
│   └── styles/
│       └── globals.css        # Global styles
├── .env.example               # Environment variable template
├── vercel.json                # Vercel config with cron
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Paystack account
- SMTP email credentials

### Step 1 — Clone & Install

```bash
git clone https://github.com/yourname/boosthive.git
cd boosthive
npm install
```

### Step 2 — Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

### Step 3 — Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed with initial data
npm run prisma:seed
```

### Step 4 — Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 🔧 Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=BoostHive

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/boosthive?schema=public"

# NextAuth — generate with: openssl rand -base64 32
AUTH_SECRET="your-super-secret-key-min-32-characters"
AUTH_URL=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="BoostHive <noreply@boosthive.com>"

# Paystack (https://dashboard.paystack.com/#/settings/developer)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Cron (generate any random string)
CRON_SECRET=your-cron-secret-here
```

---

## 💳 Paystack Setup

1. Create account at [paystack.com](https://paystack.com)
2. Go to **Settings → Developer** and copy your API keys
3. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
4. Set webhook secret and add to `.env`
5. Enable the `charge.success` and `charge.failed` events

---

## 🔌 SMM Provider Setup

1. Log in to your SMM panel admin
2. Go to **Admin → Providers → Add Provider**
3. Enter:
   - **Name**: Your provider name (e.g., "SMM Fast")
   - **API URL**: The provider's API endpoint
   - **API Key**: Your API key from the provider
4. After adding, create services and link them to the provider
5. Use the provider's service ID as the **Provider Service ID** on each service

**Compatible with any standard SMM panel API** (SMMFast, SMMPanel, Peakerr, etc.)

---

## ☁️ Deployment (Vercel)

### Step 1 — Push to GitHub

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/yourname/boosthive.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set **Framework**: Next.js
4. Add all environment variables from `.env`
5. Click **Deploy**

### Step 3 — Database (Neon/Supabase)

Use a hosted PostgreSQL service:
- **Neon** (recommended): [neon.tech](https://neon.tech) — free tier available
- **Supabase**: [supabase.com](https://supabase.com)

Copy the connection string to `DATABASE_URL` in Vercel.

### Step 4 — Post-Deploy

```bash
# Run seed on production (via Vercel CLI or locally with prod DATABASE_URL)
DATABASE_URL="your-prod-url" npm run prisma:seed
```

### Step 5 — Vercel Cron (Order Sync)

The `vercel.json` already configures a cron job to sync orders every 5 minutes:
```json
{
  "crons": [{ "path": "/api/cron/sync-orders", "schedule": "*/5 * * * *" }]
}
```
Vercel will automatically call this endpoint. Make sure `CRON_SECRET` is set.

---

## 🔑 Default Credentials

After running `npm run prisma:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@boosthive.com | Admin@123456 |
| Demo User | demo@boosthive.com | User@123456 |

**⚠️ Change these immediately in production!**

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-email` | Verify email token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Client
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List services |
| GET | `/api/orders` | List user orders |
| POST | `/api/orders` | Create new order |
| GET | `/api/wallet` | Wallet balance & transactions |
| POST | `/api/wallet/fund` | Initialize Paystack payment |
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications` | Mark all as read |
| GET | `/api/support` | List tickets |
| POST | `/api/support` | Create ticket |
| POST | `/api/support/:id/reply` | Reply to ticket |
| GET | `/api/profile` | Get profile |
| PATCH | `/api/profile` | Update profile |
| POST | `/api/profile/password` | Change password |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics` | Dashboard analytics |
| GET | `/api/admin/users` | List users |
| PATCH | `/api/admin/users/:id` | Suspend/credit/debit user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET/POST | `/api/admin/services` | List/create services |
| PATCH/DELETE | `/api/admin/services/:id` | Update/delete service |
| GET/POST | `/api/admin/providers` | List/add providers |
| GET | `/api/admin/providers/:id/balance` | Check provider balance |
| GET | `/api/admin/orders` | List all orders |
| PATCH | `/api/admin/orders/:id` | Cancel/refund/complete order |
| GET | `/api/admin/payments` | Transaction reports |
| GET/POST | `/api/admin/coupons` | List/create coupons |
| PATCH/DELETE | `/api/admin/coupons/:id` | Update/delete coupon |
| GET/POST | `/api/admin/settings` | Get/save settings |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/paystack` | Paystack payment events |
| GET | `/api/cron/sync-orders` | Order status sync (cron) |

---

## 🔒 Security Notes

- All passwords hashed with bcrypt (12 rounds)
- JWT sessions with configurable expiry
- Paystack webhook signature verification
- Admin role checked on every admin API route
- Email enumeration prevention on password reset
- Input validation with Zod on all POST endpoints
- CSRF protection via Next.js built-in
- Cron endpoint protected with secret header

---

## 📞 Support

- WhatsApp: Configurable in Admin → Settings
- Email: Configurable in Admin → Settings
- Support tickets: Built-in ticket system

---

## 📄 License

MIT License — free to use and modify for commercial projects.

---

*Built with ❤️ for the SMM industry. BoostHive — Powering Your Social Growth.*
