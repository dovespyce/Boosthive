// src/app/api/admin/settings/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const settings = await prisma.setting.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { settings } = await req.json();
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        prisma.setting.update({ where: { key }, data: { value: String(value) } })
      )
    );
    return NextResponse.json({ message: "Settings saved" });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
