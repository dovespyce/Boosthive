// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action, amount, reason } = body;

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (action === "suspend") {
      await prisma.user.update({
        where: { id: params.id },
        data: { isSuspended: true },
      });
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "SUSPEND_USER",
          entity: "User",
          entityId: params.id,
          newData: { reason },
        },
      });
      return NextResponse.json({ message: "User suspended" });
    }

    if (action === "unsuspend") {
      await prisma.user.update({
        where: { id: params.id },
        data: { isSuspended: false },
      });
      return NextResponse.json({ message: "User unsuspended" });
    }

    if (action === "credit" && amount) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: params.id },
          data: { walletBalance: { increment: amount } },
        }),
        prisma.transaction.create({
          data: {
            userId: params.id,
            type: "ADMIN_CREDIT",
            status: "COMPLETED",
            amount,
            balanceBefore: user.walletBalance,
            balanceAfter: user.walletBalance + amount,
            description: `Admin credit: ${reason || "Manual credit"}`,
          },
        }),
        prisma.notification.create({
          data: {
            userId: params.id,
            type: "SYSTEM",
            title: "Wallet Credited",
            message: `₦${amount.toLocaleString()} has been added to your wallet.`,
          },
        }),
      ]);
      return NextResponse.json({ message: "User credited" });
    }

    if (action === "debit" && amount) {
      if (user.walletBalance < amount) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      }
      await prisma.$transaction([
        prisma.user.update({
          where: { id: params.id },
          data: { walletBalance: { decrement: amount } },
        }),
        prisma.transaction.create({
          data: {
            userId: params.id,
            type: "ADMIN_DEBIT",
            status: "COMPLETED",
            amount: -amount,
            balanceBefore: user.walletBalance,
            balanceAfter: user.walletBalance - amount,
            description: `Admin debit: ${reason || "Manual debit"}`,
          },
        }),
      ]);
      return NextResponse.json({ message: "User debited" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "User deleted" });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
