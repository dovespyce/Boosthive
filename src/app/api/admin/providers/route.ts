// src/app/api/admin/providers/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SMMProvider } from "@/lib/smm-provider";
import { z } from "zod";

const providerSchema = z.object({
  name: z.string().min(1),
  apiUrl: z.string().url(),
  apiKey: z.string().min(1),
  description: z.string().optional(),
  currency: z.string().default("USD"),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const providers = await prisma.provider.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ providers });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const data = providerSchema.parse(body);
    const provider = await prisma.provider.create({ data });
    return NextResponse.json({ provider }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create provider" }, { status: 500 });
  }
}
