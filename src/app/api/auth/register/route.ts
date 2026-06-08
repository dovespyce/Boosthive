// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Check existing user
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Find referrer
    let referrerId: string | undefined;
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referralCode },
      });
      if (referrer) referrerId = referrer.id;
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        referredBy: referrerId,
      },
    });

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, token);
    } catch (e) {
      console.error("Failed to send verification email:", e);
    }

    // Track referral click increment
    if (referrerId) {
      await prisma.user.update({
        where: { id: referrerId },
        data: { referralClicks: { increment: 1 } },
      });
    }

    return NextResponse.json({
      message: "Registration successful. Please verify your email.",
      userId: user.id,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
