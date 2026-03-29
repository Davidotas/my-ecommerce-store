import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase";
import { fromDb, DbProduct } from "@/lib/products";

function generateTrackingId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MYK-2026-${result}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Payment processing is not configured. Please contact support." }, { status: 503 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { items, userId, userEmail, userName, shippingAddress, paymentMethod } = await req.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items in cart" }, { status: 400 });
  }

  const ids = items.map((i: { id: string }) => i.id);
  const { data: dbProducts, error } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const productMap = new Map(
    (dbProducts ?? []).map((p) => [p.id, fromDb(p as DbProduct)])
  );

  const totalAmount = items.reduce((sum: number, item: { id: string; price?: number; quantity: number }) => {
    const product = productMap.get(item.id);
    const price = product?.price ?? item.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  if (totalAmount <= 0) {
    return NextResponse.json({ error: "Order total must be greater than zero." }, { status: 400 });
  }

  // Save a pending order in Supabase before charging
  let orderId: string | null = null;
  if (userId) {
    const orderItems = items.map((item: { id: string; name?: string; price?: number; image?: string; quantity: number; customization?: { summary: string; fabricJson?: string } }) => {
      const product = productMap.get(item.id);
      let customizationPayload: Record<string, unknown> | undefined;
      if (item.customization) {
        customizationPayload = { summary: item.customization.summary };
        if (item.customization.fabricJson) {
          try {
            const parsed = JSON.parse(item.customization.fabricJson);
            if (parsed.smartPrompt) customizationPayload.prompt = parsed.smartPrompt;
            customizationPayload.details = parsed;
          } catch { /* ignore parse errors */ }
        }
      }
      return {
        id: item.id,
        name:     product?.name  ?? item.name  ?? "Custom Order",
        price:    product?.price ?? item.price ?? 0,
        quantity: item.quantity,
        image:    product?.image ?? item.image ?? "",
        ...(customizationPayload ? { customization: customizationPayload } : {}),
      };
    });

    const trackingId = generateTrackingId();
    const admin = createAdminClient();

    const insertPayload = {
      user_id: userId,
      customer_email: userEmail,
      items: orderItems,
      total_amount: totalAmount,
      status: "placed",
      shipping_address: shippingAddress,
      payment_method: paymentMethod ?? "card",
      tracking_id: trackingId,
    };

    console.log("[checkout] Inserting order with payload:", JSON.stringify(insertPayload, null, 2));

    const { data: order, error: insertError } = await admin
      .from("orders")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertError) {
      console.error("[checkout] Order insert FAILED:", JSON.stringify(insertError));
      return NextResponse.json(
        { error: `Failed to save order: ${insertError.message} (code: ${insertError.code})` },
        { status: 500 }
      );
    }

    orderId = order?.id ?? null;
    console.log("[checkout] Order saved OK, id:", orderId, "tracking:", trackingId);
  }

  // Create a PaymentIntent — client will confirm it directly with the card details
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "usd",
      receipt_email: userEmail || undefined,
      metadata: {
        order_id: orderId ?? "",
        user_id:  userId  ?? "",
      },
      description: `Mykolo Mysibi order${orderId ? ` #${orderId.slice(0, 8).toUpperCase()}` : ""}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Stripe PaymentIntent creation failed:", msg);
    return NextResponse.json({ error: `Payment setup failed: ${msg}` }, { status: 500 });
  }

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, orderId });
}
