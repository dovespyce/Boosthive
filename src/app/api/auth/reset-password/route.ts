// src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = schema.parse(body);

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.used) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }
    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
