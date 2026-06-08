// src/app/api/admin/services/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string(),
  providerId: z.string(),
  providerServiceId: z.string().optional(),
  pricePerThousand: z.number().positive(),
  minQuantity: z.number().int().positive(),
  maxQuantity: z.number().int().positive(),
  averageTime: z.string().optional(),
  successRate: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [services, total, categories, providers] = await Promise.all([
      prisma.service.findMany({
        include: { category: true, provider: true },
        orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
        skip,
        take: limit,
      }),
      prisma.service.count(),
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.provider.findMany({ where: { isActive: true } }),
    ]);

    return NextResponse.json({ services, total, categories, providers });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = serviceSchema.parse(body);

    const service = await prisma.service.create({ data });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
