// src/app/api/auth/verify-email/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    const vToken = await prisma.verificationToken.findUnique({ where: { token } });
    if (!vToken) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    if (vToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: vToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ]);

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (e) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
