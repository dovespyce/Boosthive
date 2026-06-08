# ⚡ BoostHive — Quick Start Guide

## 🚀 5-Minute Setup

### 1. Extract & Install
```bash
cd boosthive
npm install
```

### 2. Setup Database
```bash
# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your PostgreSQL database URL
# DATABASE_URL="postgresql://user:pass@localhost:5432/boosthive"

# Setup database
npm run prisma:push
npm run prisma:seed
```

### 3. Configure Credentials
Edit `.env`:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
SMTP_HOST=smtp.gmail.com
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
```

### 4. Run Locally
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔑 Default Login Credentials

After seeding, use these to login:

### Admin Dashboard
- Email: `admin@boosthive.com`
- Password: `Admin@123456`
- Access: http://localhost:3000/admin

### Client Dashboard  
- Email: `demo@boosthive.com`
- Password: `User@123456`
- Access: http://localhost:3000/dashboard

**⚠️ SECURITY: Change these passwords immediately in production!**

---

## 🛠️ Key Setup Steps

### Paystack Integration
1. Create account: https://paystack.com
2. Get API keys from: **Settings → Developer**
3. Add webhook: `https://yourdomain.com/api/webhooks/paystack`
4. Update `.env` with keys

### Email (Gmail)
1. Enable 2FA on your Google account
2. Create App Password: https://myaccount.google.com/apppasswords
3. Update SMTP credentials in `.env`

### SMM Provider
1. Login as admin
2. Go to **Admin → Providers**
3. Add your SMM panel API details
4. Create services and link to provider

### Cron Jobs (Vercel Only)
Automatic order syncing every 5 minutes via `vercel.json`

---

## 📦 Production Deployment (Vercel)

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "Initial"
git push origin main
```

### 2. Deploy
- Go to https://vercel.com
- Click "New Project" → Import GitHub repo
- Add environment variables
- Click Deploy

### 3. Database (Neon Recommended)
- Sign up: https://neon.tech
- Create database
- Copy connection string to `DATABASE_URL`
- Run seed: `DATABASE_URL=... npm run prisma:seed`

### 4. Update Environment
- Set `NEXT_PUBLIC_APP_URL` to your Vercel domain
- Update Paystack webhook URL in dashboard
- Update SMTP credentials if using prod email

---

## 📋 What's Included

✅ **Complete Authentication System**
- Register, login, password reset, email verification
- JWT sessions with NextAuth v5
- Admin role-based access control

✅ **Client Features**  
- Service browsing with categories
- Order placement with auto-pricing
- Wallet funding via Paystack
- Order tracking (pending → completed)
- Referral system with earnings
- Support tickets with admin replies
- In-app notifications

✅ **Admin Panel**
- Real-time analytics with charts
- User management
- Order management
- Service CRUD
- SMM provider management
- Coupon codes
- Payment reports
- Settings

✅ **Database**
- PostgreSQL with Prisma ORM
- 20+ models for complete functionality
- Automatic migrations
- Seed data included

✅ **API Routes (40+ endpoints)**
- Authentication APIs
- Order management
- Wallet & payments
- Admin management
- Webhooks (Paystack)
- Cron jobs (order sync)

✅ **UI/UX**
- Premium dark mode design (default)
- Light mode option
- Mobile-first responsive
- Fast loading
- Tailwind CSS with design tokens

---

## 🔧 Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm start                      # Start prod server

# Database
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Create migration
npm run prisma:push           # Push schema (no migration)
npm run prisma:seed           # Seed test data
npm run prisma:studio         # Open database GUI

# Deployment
vercel                         # Deploy to Vercel
vercel --prod                 # Production deployment
```

---

## 📞 Support & Contact

- **WhatsApp**: Configure in Admin → Settings
- **Email**: Configure in Admin → Settings  
- **Tickets**: Built-in support ticket system
- **Contact**: Update footer links in landing page

---

## ✨ Next Steps

1. ✅ Change default admin password
2. ✅ Configure SMTP for emails
3. ✅ Setup Paystack account & add webhook
4. ✅ Add your first SMM provider
5. ✅ Create services and pricing
6. ✅ Test order flow end-to-end
7. ✅ Deploy to Vercel
8. ✅ Monitor analytics

---

## 🆘 Common Issues

**"Database connection failed"**
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify credentials

**"Paystack payment not working"**
- Check webhook URL is correct
- Verify secret keys match dashboard
- Test with Paystack test card: 4111111111111111

**"Emails not sending"**
- Verify SMTP credentials
- Check Gmail has 2FA enabled
- Confirm App Password is correct
- Check spam folder

**"Admin routes showing 403"**
- Verify user has ADMIN role in database
- Check NextAuth session is valid
- Clear browser cookies and login again

---

*Happy coding! 🚀 Build amazing things with BoostHive.*
