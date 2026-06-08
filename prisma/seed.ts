// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding BoostHive database...");

  // Admin user
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@boosthive.com" },
    update: {},
    create: {
      name: "BoostHive Admin",
      email: "admin@boosthive.com",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
      phone: "+1234567890",
      walletBalance: 1000,
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Demo user
  const userPassword = await bcrypt.hash("User@123456", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@boosthive.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@boosthive.com",
      password: userPassword,
      role: Role.USER,
      emailVerified: new Date(),
      phone: "+1987654321",
      walletBalance: 50,
    },
  });
  console.log("✅ Demo user created:", demoUser.email);

  // Provider
  const provider = await prisma.provider.upsert({
    where: { id: "provider-1" },
    update: {},
    create: {
      id: "provider-1",
      name: "SMM Panel Pro",
      apiUrl: "https://smmfast.com/api/v2",
      apiKey: "YOUR_API_KEY_HERE",
      isActive: true,
      balance: 500,
      currency: "USD",
      description: "Premium SMM provider with fast delivery",
    },
  });
  console.log("✅ Provider created:", provider.name);

  // Categories
  const categories = [
    { name: "TikTok", slug: "tiktok", icon: "🎵", sortOrder: 1 },
    { name: "Instagram", slug: "instagram", icon: "📸", sortOrder: 2 },
    { name: "YouTube", slug: "youtube", icon: "▶️", sortOrder: 3 },
    { name: "Facebook", slug: "facebook", icon: "👤", sortOrder: 4 },
    { name: "Twitter/X", slug: "twitter", icon: "🐦", sortOrder: 5 },
    { name: "Telegram", slug: "telegram", icon: "✈️", sortOrder: 6 },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
    createdCategories[cat.slug] = created.id;
    console.log(`✅ Category: ${cat.name}`);
  }

  // Services
  const services = [
    // TikTok
    {
      name: "TikTok Followers - Real & Active",
      categorySlug: "tiktok",
      pricePerThousand: 8.5,
      minQuantity: 100,
      maxQuantity: 100000,
      averageTime: "0-1 hour",
      successRate: 98.5,
      providerServiceId: "101",
    },
    {
      name: "TikTok Likes - Instant Delivery",
      categorySlug: "tiktok",
      pricePerThousand: 3.2,
      minQuantity: 50,
      maxQuantity: 500000,
      averageTime: "0-30 min",
      successRate: 99.2,
      providerServiceId: "102",
    },
    {
      name: "TikTok Views - High Quality",
      categorySlug: "tiktok",
      pricePerThousand: 1.5,
      minQuantity: 1000,
      maxQuantity: 10000000,
      averageTime: "0-15 min",
      successRate: 99.8,
      providerServiceId: "103",
    },
    {
      name: "TikTok Comments - Custom",
      categorySlug: "tiktok",
      pricePerThousand: 45.0,
      minQuantity: 10,
      maxQuantity: 10000,
      averageTime: "1-3 hours",
      successRate: 97.0,
      providerServiceId: "104",
    },
    // Instagram
    {
      name: "Instagram Followers - Real",
      categorySlug: "instagram",
      pricePerThousand: 12.0,
      minQuantity: 100,
      maxQuantity: 50000,
      averageTime: "1-6 hours",
      successRate: 97.5,
      providerServiceId: "201",
    },
    {
      name: "Instagram Likes - Fast",
      categorySlug: "instagram",
      pricePerThousand: 4.5,
      minQuantity: 50,
      maxQuantity: 100000,
      averageTime: "0-30 min",
      successRate: 99.5,
      providerServiceId: "202",
    },
    {
      name: "Instagram Views (Reels)",
      categorySlug: "instagram",
      pricePerThousand: 2.0,
      minQuantity: 500,
      maxQuantity: 5000000,
      averageTime: "0-30 min",
      successRate: 99.9,
      providerServiceId: "203",
    },
    {
      name: "Instagram Story Views",
      categorySlug: "instagram",
      pricePerThousand: 3.5,
      minQuantity: 100,
      maxQuantity: 1000000,
      averageTime: "0-1 hour",
      successRate: 99.0,
      providerServiceId: "204",
    },
    // YouTube
    {
      name: "YouTube Views - Retention",
      categorySlug: "youtube",
      pricePerThousand: 7.0,
      minQuantity: 1000,
      maxQuantity: 1000000,
      averageTime: "0-24 hours",
      successRate: 98.0,
      providerServiceId: "301",
    },
    {
      name: "YouTube Subscribers",
      categorySlug: "youtube",
      pricePerThousand: 25.0,
      minQuantity: 100,
      maxQuantity: 10000,
      averageTime: "1-3 days",
      successRate: 95.0,
      providerServiceId: "302",
    },
    {
      name: "YouTube Likes",
      categorySlug: "youtube",
      pricePerThousand: 8.0,
      minQuantity: 50,
      maxQuantity: 50000,
      averageTime: "0-6 hours",
      successRate: 98.5,
      providerServiceId: "303",
    },
    // Facebook
    {
      name: "Facebook Page Likes",
      categorySlug: "facebook",
      pricePerThousand: 9.5,
      minQuantity: 100,
      maxQuantity: 50000,
      averageTime: "1-12 hours",
      successRate: 97.0,
      providerServiceId: "401",
    },
    {
      name: "Facebook Post Likes",
      categorySlug: "facebook",
      pricePerThousand: 5.5,
      minQuantity: 50,
      maxQuantity: 100000,
      averageTime: "0-1 hour",
      successRate: 98.5,
      providerServiceId: "402",
    },
  ];

  for (const s of services) {
    const categoryId = createdCategories[s.categorySlug];
    await prisma.service.create({
      data: {
        name: s.name,
        categoryId,
        providerId: provider.id,
        pricePerThousand: s.pricePerThousand,
        minQuantity: s.minQuantity,
        maxQuantity: s.maxQuantity,
        averageTime: s.averageTime,
        successRate: s.successRate,
        providerServiceId: s.providerServiceId,
        isActive: true,
        isFeatured: Math.random() > 0.6,
      },
    });
    console.log(`✅ Service: ${s.name}`);
  }

  // Settings
  const settings = [
    { key: "site_name", value: "BoostHive", group: "general", label: "Site Name" },
    { key: "site_tagline", value: "Powering Your Social Growth", group: "general", label: "Tagline" },
    { key: "site_email", value: "support@boosthive.com", group: "general", label: "Support Email" },
    { key: "site_whatsapp", value: "+1234567890", group: "general", label: "WhatsApp Number" },
    { key: "currency", value: "NGN", group: "payment", label: "Currency" },
    { key: "currency_symbol", value: "₦", group: "payment", label: "Currency Symbol" },
    { key: "min_deposit", value: "500", type: "number", group: "payment", label: "Minimum Deposit" },
    { key: "max_deposit", value: "1000000", type: "number", group: "payment", label: "Maximum Deposit" },
    { key: "paystack_public_key", value: "pk_test_your_key_here", group: "payment", label: "Paystack Public Key" },
    { key: "paystack_secret_key", value: "sk_test_your_key_here", group: "payment", label: "Paystack Secret Key" },
    { key: "referral_commission", value: "5", type: "number", group: "referral", label: "Referral Commission %" },
    { key: "referral_enabled", value: "true", type: "boolean", group: "referral", label: "Enable Referrals" },
    { key: "email_verification_required", value: "true", type: "boolean", group: "auth", label: "Require Email Verification" },
    { key: "maintenance_mode", value: "false", type: "boolean", group: "general", label: "Maintenance Mode" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: { key: setting.key, value: setting.value, type: setting.type || "string", group: setting.group, label: setting.label },
    });
  }
  console.log("✅ Settings seeded");

  // Sample coupon
  await prisma.coupon.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: {
      code: "WELCOME20",
      description: "20% off your first order",
      discountType: "percentage",
      discountValue: 20,
      minOrderAmount: 500,
      maxUses: 100,
      isActive: true,
    },
  });
  console.log("✅ Sample coupon created: WELCOME20");

  console.log("\n🎉 Seeding complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin Login: admin@boosthive.com / Admin@123456");
  console.log("Demo Login:  demo@boosthive.com  / User@123456");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
