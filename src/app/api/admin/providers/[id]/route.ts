// src/app/api/admin/providers/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const data = await req.json();
    const provider = await prisma.provider.update({ where: { id: params.id }, data });
    return NextResponse.json({ provider });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.provider.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Provider deleted" });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
