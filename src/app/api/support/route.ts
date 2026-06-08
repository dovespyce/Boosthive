// src/app/api/support/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTicketNumber } from "@/lib/utils";
import { z } from "zod";

const createTicketSchema = z.object({
  subject: z.string().min(5),
  message: z.string().min(10),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const where: any =
      session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        replies: { orderBy: { createdAt: "asc" } },
        _count: { select: { replies: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = createTicketSchema.parse(body);

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: generateTicketNumber(),
        userId: session.user.id,
        subject: data.subject,
        priority: data.priority,
        replies: {
          create: {
            userId: session.user.id,
            message: data.message,
            isAdmin: false,
          },
        },
      },
      include: { replies: true },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
