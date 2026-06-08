// src/lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BoostHive</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; background: #0f1117; color: #f5f5f0; }
    .container { max-width: 600px; margin: 40px auto; background: #161b27; border-radius: 16px; overflow: hidden; border: 1px solid #1e2535; }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #0f1117; }
    .header p { margin: 8px 0 0; color: #0f1117; opacity: 0.8; }
    .body { padding: 40px; }
    .button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #0f1117; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { padding: 24px 40px; border-top: 1px solid #1e2535; text-align: center; color: #64748b; font-size: 14px; }
    .divider { height: 1px; background: #1e2535; margin: 24px 0; }
    p { line-height: 1.6; color: #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐝 BoostHive</h1>
      <p>Powering Your Social Growth</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} BoostHive. All rights reserved.</p>
      <p>If you did not request this email, please ignore it.</p>
    </div>
  </div>
</body>
</html>`;

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify your BoostHive account",
    html: baseTemplate(`
      <h2>Welcome to BoostHive, ${name}! 👋</h2>
      <p>You're one step away from powering your social growth. Please verify your email address to activate your account.</p>
      <div style="text-align:center">
        <a href="${url}" class="button">Verify Email Address</a>
      </div>
      <div class="divider"></div>
      <p>Or copy this link: <code style="background:#1e2535;padding:4px 8px;border-radius:4px;font-size:13px;">${url}</code></p>
      <p>This link expires in 24 hours.</p>
    `),
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset your BoostHive password",
    html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${name}, we received a request to reset your BoostHive password.</p>
      <div style="text-align:center">
        <a href="${url}" class="button">Reset Password</a>
      </div>
      <div class="divider"></div>
      <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    `),
  });
}

export async function sendOrderStatusEmail(
  email: string,
  name: string,
  orderNumber: string,
  serviceName: string,
  status: string
) {
  const statusMessages: Record<string, string> = {
    COMPLETED: "🎉 Your order has been completed successfully!",
    PROCESSING: "⚙️ Your order is being processed.",
    CANCELLED: "❌ Your order has been cancelled.",
    PARTIAL: "⚠️ Your order has been partially completed.",
    REFUNDED: "💰 Your order has been refunded.",
  };
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Order ${orderNumber} Update - ${status}`,
    html: baseTemplate(`
      <h2>Order Update</h2>
      <p>Hi ${name}, ${statusMessages[status] || "Your order status has been updated."}</p>
      <div style="background:#1e2535;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:0"><strong>Order:</strong> ${orderNumber}</p>
        <p style="margin:8px 0 0"><strong>Service:</strong> ${serviceName}</p>
        <p style="margin:8px 0 0"><strong>Status:</strong> ${status}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" class="button">View Order</a>
    `),
  });
}

export async function sendPaymentSuccessEmail(
  email: string,
  name: string,
  amount: number,
  reference: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Payment Successful - Wallet Funded",
    html: baseTemplate(`
      <h2>💰 Payment Successful!</h2>
      <p>Hi ${name}, your wallet has been funded successfully.</p>
      <div style="background:#1e2535;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:0"><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
        <p style="margin:8px 0 0"><strong>Reference:</strong> ${reference}</p>
        <p style="margin:8px 0 0"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
    `),
  });
}

export async function sendReferralBonusEmail(
  email: string,
  name: string,
  amount: number
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "🎉 Referral Bonus Earned!",
    html: baseTemplate(`
      <h2>You earned a referral bonus!</h2>
      <p>Hi ${name}, someone you referred just made a purchase and you've earned a commission!</p>
      <div style="background:#1e2535;padding:20px;border-radius:8px;margin:20px 0;text-align:center;">
        <p style="font-size:36px;margin:0;color:#f59e0b;font-weight:700">₦${amount.toLocaleString()}</p>
        <p style="margin:8px 0 0;color:#94a3b8">Added to your wallet</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/referral" class="button">View Referral Dashboard</a>
    `),
  });
}
