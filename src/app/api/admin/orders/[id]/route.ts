// src/app/api/admin/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action } = await req.json();
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { user: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (action === "cancel") {
      await prisma.order.update({
        where: { id: params.id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ message: "Order cancelled" });
    }

    if (action === "refund") {
      if (order.status === "REFUNDED") {
        return NextResponse.json({ error: "Order already refunded" }, { status: 400 });
      }
      await prisma.$transaction([
        prisma.order.update({
          where: { id: params.id },
          data: { status: "REFUNDED", refundAmount: order.charge },
        }),
        prisma.user.update({
          where: { id: order.userId },
          data: { walletBalance: { increment: order.charge } },
        }),
        prisma.transaction.create({
          data: {
            userId: order.userId,
            type: "REFUND",
            status: "COMPLETED",
            amount: order.charge,
            balanceBefore: order.user.walletBalance,
            balanceAfter: order.user.walletBalance + order.charge,
            description: `Refund for order #${order.orderNumber}`,
          },
        }),
        prisma.notification.create({
          data: {
            userId: order.userId,
            type: "SYSTEM",
            title: "Order Refunded",
            message: `Order #${order.orderNumber} has been refunded. ₦${order.charge.toLocaleString()} added to your wallet.`,
          },
        }),
      ]);
      return NextResponse.json({ message: "Order refunded" });
    }

    if (action === "complete") {
      await prisma.order.update({
        where: { id: params.id },
        data: { status: "COMPLETED" },
      });
      return NextResponse.json({ message: "Order marked as completed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
