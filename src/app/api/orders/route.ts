// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitOrderToProvider } from "@/lib/smm-provider";
import { generateOrderNumber, calculateOrderCost } from "@/lib/utils";
import { z } from "zod";

const createOrderSchema = z.object({
  serviceId: z.string(),
  link: z.string().url("Please enter a valid URL"),
  quantity: z.number().int().positive(),
  couponCode: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where: any = { userId: session.user.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { service: { include: { category: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = createOrderSchema.parse(body);

    const service = await prisma.service.findUnique({
      where: { id: data.serviceId, isActive: true },
      include: { provider: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found or unavailable" }, { status: 404 });
    }

    if (data.quantity < service.minQuantity || data.quantity > service.maxQuantity) {
      return NextResponse.json(
        { error: `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const baseCost = calculateOrderCost(data.quantity, service.pricePerThousand);
    let finalCost = baseCost;
    let discountAmount = 0;
    let couponCode: string | undefined;

    // Apply coupon
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase(), isActive: true },
      });

      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          if (baseCost >= coupon.minOrderAmount) {
            if (coupon.discountType === "percentage") {
              discountAmount = (baseCost * coupon.discountValue) / 100;
            } else {
              discountAmount = coupon.discountValue;
            }
            finalCost = Math.max(0, baseCost - discountAmount);
            couponCode = coupon.code;
          }
        }
      }
    }

    if (user.walletBalance < finalCost) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // Estimate provider cost (80% of selling price as example)
    const providerCost = calculateOrderCost(data.quantity, service.pricePerThousand * 0.7);
    const profit = finalCost - providerCost;

    const orderNumber = generateOrderNumber();

    // Create order and deduct from wallet in transaction
    const [order] = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          serviceId: data.serviceId,
          providerId: service.providerId,
          link: data.link,
          quantity: data.quantity,
          charge: finalCost,
          providerCost,
          profit,
          couponCode,
          discountAmount,
          status: "PENDING",
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          walletBalance: { decrement: finalCost },
          totalSpent: { increment: finalCost },
        },
      });

      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: "ORDER_PAYMENT",
          status: "COMPLETED",
          amount: -finalCost,
          balanceBefore: user.walletBalance,
          balanceAfter: user.walletBalance - finalCost,
          description: `Order #${orderNumber} - ${service.name}`,
          metadata: { orderId: order.id },
        },
      });

      // Update coupon usage
      if (couponCode) {
        await tx.coupon.update({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } },
        });
        await tx.couponUsage.create({
          data: {
            couponId: (await tx.coupon.findUnique({ where: { code: couponCode } }))!.id,
            userId: session.user.id,
            orderId: order.id,
          },
        });
      }

      // Update service order count
      await tx.service.update({
        where: { id: data.serviceId },
        data: { totalOrders: { increment: 1 } },
      });

      return [order];
    });

    // Submit to provider asynchronously
    submitOrderToProvider(order.id).catch(console.error);

    // Handle referral commission
    if (user.referredBy) {
      const settings = await prisma.setting.findUnique({ where: { key: "referral_commission" } });
      const commissionRate = parseFloat(settings?.value || "5") / 100;
      const commission = finalCost * commissionRate;

      if (commission > 0) {
        const referrer = await prisma.user.findUnique({ where: { id: user.referredBy } });
        if (referrer) {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: user.referredBy },
              data: {
                walletBalance: { increment: commission },
                referralEarnings: { increment: commission },
              },
            }),
            prisma.referralPayment.create({
              data: { referrerId: user.referredBy, referredId: user.id, orderId: order.id, amount: commission },
            }),
            prisma.notification.create({
              data: {
                userId: user.referredBy,
                type: "REFERRAL_BONUS",
                title: "Referral Commission Earned!",
                message: `You earned ₦${commission.toFixed(2)} commission from a referral order.`,
              },
            }),
          ]);
        }
      }
    }

    return NextResponse.json({ order, message: "Order placed successfully" }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
