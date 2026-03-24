import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { orderId, sessionId } = await req.json();
    if (!orderId || !sessionId) {
      return NextResponse.json({ error: "Missing orderId or sessionId" }, { status: 400 });
    }

    // Verify with Stripe that the payment actually succeeded
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
    }

    const admin = createAdminClient();
    await admin
      .from("orders")
      .update({
        status: "processing",
        stripe_session_id: sessionId,
        stripe_payment_intent_id: typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[order/confirm]", err);
    return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
  }
}
