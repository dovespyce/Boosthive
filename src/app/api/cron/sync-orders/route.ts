// src/app/api/cron/sync-orders/route.ts
import { NextResponse } from "next/server";
import { syncOrderStatuses } from "@/lib/smm-provider";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncOrderStatuses();
    return NextResponse.json({ message: "Order sync completed", timestamp: new Date() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
