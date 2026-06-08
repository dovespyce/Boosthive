// src/app/api/support/[id]/reply/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    // Non-admins can only reply to their own tickets
    if (session.user.role !== "ADMIN" && ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: params.id,
        userId: session.user.id,
        message: message.trim(),
        isAdmin: session.user.role === "ADMIN",
      },
    });

    // Update ticket status to IN_PROGRESS when admin replies
    if (session.user.role === "ADMIN" && ticket.status === "OPEN") {
      await prisma.ticket.update({ where: { id: params.id }, data: { status: "IN_PROGRESS" } });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          type: "SYSTEM",
          title: "Support Reply",
          message: `Admin replied to your ticket: ${ticket.subject}`,
        },
      });
    }

    // Update ticket timestamp
    await prisma.ticket.update({ where: { id: params.id }, data: { updatedAt: new Date() } });

    return NextResponse.json({ reply }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
