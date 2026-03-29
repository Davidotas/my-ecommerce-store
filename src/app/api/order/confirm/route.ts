import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { orderId, paymentIntentId } = await req.json();
    if (!orderId || !paymentIntentId) {
      return NextResponse.json({ error: "Missing orderId or paymentIntentId" }, { status: 400 });
    }

    // Verify with Stripe that the payment actually succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
    }

    const admin = createAdminClient();
    await admin
      .from("orders")
      .update({
        status: "processing",
        stripe_payment_intent_id: paymentIntentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[order/confirm]", err);
    return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
  }
}
