import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify the order exists and is still pending before marking as processing
    const { data: order } = await admin
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only update if still placed/pending (idempotent — safe to call multiple times)
    if (order.status === "placed" || order.status === "pending") {
      await admin
        .from("orders")
        .update({
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }

    // Return tracking_id so the success page can display it without a second RLS-blocked query
    const { data: updated } = await admin
      .from("orders")
      .select("tracking_id")
      .eq("id", orderId)
      .single();

    return NextResponse.json({ ok: true, trackingId: updated?.tracking_id ?? null });
  } catch (err) {
    console.error("[order/confirm]", err);
    return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
  }
}
