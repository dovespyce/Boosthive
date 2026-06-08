// src/app/api/services/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const where: any = { isActive: true };
    if (category) where.category = { slug: category };
    if (featured === "true") where.isFeatured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { totalOrders: "desc" }],
    });

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ services, categories });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
