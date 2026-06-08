// src/app/api/webhooks/paystack/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction, verifyWebhookSignature } from "@/lib/paystack";
import { sendPaymentSuccessEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      // Verify with Paystack API
      const verification = await verifyTransaction(reference);
      if (verification.status !== "success") {
        return NextResponse.json({ received: true });
      }

      const transaction = await prisma.transaction.findUnique({
        where: { reference },
        include: { user: true },
      });

      if (!transaction || transaction.status === "COMPLETED") {
        return NextResponse.json({ received: true });
      }

      const amount = verification.amount / 100; // Convert from kobo

      // Credit user wallet
      await prisma.$transaction([
        prisma.user.update({
          where: { id: transaction.userId },
          data: {
            walletBalance: { increment: amount },
            totalDeposited: { increment: amount },
          },
        }),
        prisma.transaction.update({
          where: { reference },
          data: {
            status: "COMPLETED",
            amount,
            metadata: event.data,
          },
        }),
        prisma.notification.create({
          data: {
            userId: transaction.userId,
            type: "PAYMENT_SUCCESS",
            title: "Payment Successful",
            message: `Your wallet has been funded with ₦${amount.toLocaleString()}.`,
            data: { reference, amount },
          },
        }),
      ]);

      // Send email
      try {
        await sendPaymentSuccessEmail(
          transaction.user.email,
          transaction.user.name,
          amount,
          reference
        );
      } catch (e) {
        console.error("Email error:", e);
      }
    }

    if (event.event === "charge.failed") {
      const reference = event.data.reference;
      await prisma.transaction.updateMany({
        where: { reference, status: "PENDING" },
        data: {
          status: "FAILED",
          metadata: event.data,
        },
      });

      const transaction = await prisma.transaction.findUnique({ where: { reference } });
      if (transaction) {
        await prisma.notification.create({
          data: {
            userId: transaction.userId,
            type: "PAYMENT_FAILED",
            title: "Payment Failed",
            message: "Your payment could not be processed. Please try again.",
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
