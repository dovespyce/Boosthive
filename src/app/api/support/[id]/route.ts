// src/app/api/support/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { status } = await req.json();
    const ticket = await prisma.ticket.update({ where: { id: params.id }, data: { status } });
    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
