// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ message: "If that email exists, a reset link has been sent." });

    // Invalidate old tokens
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (e) {
      console.error("Failed to send reset email:", e);
    }

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  } catch (e) {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
