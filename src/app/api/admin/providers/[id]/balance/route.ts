// src/app/api/admin/providers/[id]/balance/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SMMProvider } from "@/lib/smm-provider";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const provider = await prisma.provider.findUnique({ where: { id: params.id } });
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

    const smmProvider = new SMMProvider(provider.apiUrl, provider.apiKey);
    const balanceData = await smmProvider.getBalance();

    // Update stored balance
    await prisma.provider.update({
      where: { id: params.id },
      data: { balance: parseFloat(balanceData.balance) || 0 },
    });

    return NextResponse.json(balanceData);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch balance" }, { status: 500 });
  }
}
