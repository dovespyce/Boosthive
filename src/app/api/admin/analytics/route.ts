// src/app/api/admin/analytics/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30";
    const days = parseInt(range);

    const now = new Date();
    const rangeStart = subDays(now, days);

    // Summary stats
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProfit,
      pendingOrders,
      processingOrders,
      completedOrders,
      newUsersToday,
      revenueToday,
      activeProviders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.count(),
      prisma.transaction.aggregate({
        where: { type: "DEPOSIT", status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { profit: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.user.count({
        where: { createdAt: { gte: startOfDay(now), lte: endOfDay(now) } },
      }),
      prisma.transaction.aggregate({
        where: {
          type: "DEPOSIT",
          status: "COMPLETED",
          createdAt: { gte: startOfDay(now), lte: endOfDay(now) },
        },
        _sum: { amount: true },
      }),
      prisma.provider.count({ where: { isActive: true } }),
    ]);

    // Daily revenue chart
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(now, i);
      const [revenue, orders, newUsers] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            type: "DEPOSIT",
            status: "COMPLETED",
            createdAt: { gte: startOfDay(day), lte: endOfDay(day) },
          },
          _sum: { amount: true },
        }),
        prisma.order.count({
          where: { createdAt: { gte: startOfDay(day), lte: endOfDay(day) } },
        }),
        prisma.user.count({
          where: { createdAt: { gte: startOfDay(day), lte: endOfDay(day) } },
        }),
      ]);

      dailyData.push({
        date: format(day, "MMM d"),
        revenue: revenue._sum.amount || 0,
        orders,
        newUsers,
      });
    }

    // Top services
    const topServices = await prisma.service.findMany({
      orderBy: { totalOrders: "desc" },
      take: 5,
      include: { category: true },
      where: { totalOrders: { gt: 0 } },
    });

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        service: { select: { name: true } },
      },
    });

    // Order status breakdown
    const orderStatusBreakdown = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    return NextResponse.json({
      summary: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalProfit: totalProfit._sum.profit || 0,
        pendingOrders,
        processingOrders,
        completedOrders,
        newUsersToday,
        revenueToday: revenueToday._sum.amount || 0,
        activeProviders,
      },
      dailyData,
      topServices,
      recentOrders,
      orderStatusBreakdown,
    });
  } catch (e) {
    console.error("Analytics error:", e);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
