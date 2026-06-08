// src/app/api/admin/payments/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");
    const skip = (page - 1) * limit;

    const [transactions, total, deposits, refunds] = await Promise.all([
      prisma.transaction.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        where: { type: "DEPOSIT", status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "REFUND", status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      transactions,
      total,
      stats: {
        totalDeposits: deposits._sum.amount || 0,
        totalRefunds: refunds._sum.amount || 0,
        totalCount: total,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
