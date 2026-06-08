// src/app/api/wallet/fund/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const fundSchema = z.object({
  amount: z.number().min(500, "Minimum deposit is ₦500").max(1000000, "Maximum deposit is ₦1,000,000"),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { amount } = fundSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const reference = `BH-${uuidv4().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

    // Create pending transaction
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: "DEPOSIT",
        status: "PENDING",
        amount,
        balanceBefore: user.walletBalance,
        balanceAfter: user.walletBalance + amount,
        reference,
        description: `Wallet funding via Paystack`,
        paystackRef: reference,
      },
    });

    // Initialize Paystack
    const paystackData = await initializeTransaction(
      user.email,
      amount * 100, // Convert to kobo
      reference,
      { userId: user.id, type: "wallet_funding" }
    );

    return NextResponse.json({
      authorizationUrl: paystackData.authorization_url,
      reference,
      accessCode: paystackData.access_code,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Fund wallet error:", error);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
