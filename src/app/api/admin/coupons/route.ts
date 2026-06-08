// src/app/api/admin/coupons/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ coupons });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const data = await req.json();
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    const coupon = await prisma.coupon.create({ data });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
