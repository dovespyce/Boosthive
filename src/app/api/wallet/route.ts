// src/app/api/wallet/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [user, transactions, total] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { walletBalance: true, totalSpent: true, totalDeposited: true },
      }),
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({ wallet: user, transactions, total });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}
