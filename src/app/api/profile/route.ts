// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, createdAt: true, referralCode: true, emailVerified: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { name, phone } = await req.json();
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, phone },
      select: { name: true, phone: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
