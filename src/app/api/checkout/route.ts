import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase";
import { fromDb, DbProduct } from "@/lib/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { items, userId, userEmail, shippingAddress } = await req.json();

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

  const lineItems = items.map((item: { id: string; name?: string; price?: number; description?: string; image?: string; quantity: number }) => {
    const product = productMap.get(item.id);
    // Fall back to cart item data for custom orders not in DB
    const name        = product?.name        ?? item.name        ?? "Custom Order";
    const unitAmount  = product?.price       ?? item.price       ?? 0;
    const description = product?.description ?? item.description ?? undefined;
    const images      = product?.image ? [product.image] : [];
    return {
      price_data: {
        currency: "usd",
        product_data: { name, description, images },
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    };
  });

  const totalAmount = items.reduce((sum: number, item: { id: string; price?: number; quantity: number }) => {
    const product = productMap.get(item.id);
    const price = product?.price ?? item.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  // Save a pending order before redirecting to Stripe
  let orderId: string | null = null;
  if (userId) {
    const orderItems = items.map((item: { id: string; name?: string; price?: number; image?: string; quantity: number; customization?: { summary: string; fabricJson?: string } }) => {
      const product = productMap.get(item.id);
      let customizationPayload: Record<string, unknown> | undefined;
      if (item.customization) {
        customizationPayload = { summary: item.customization.summary };
        // Parse smart prompt from custom order JSON
        if (item.customization.fabricJson) {
          try {
            const parsed = JSON.parse(item.customization.fabricJson);
            if (parsed.smartPrompt) customizationPayload.prompt = parsed.smartPrompt;
            customizationPayload.details = parsed;
          } catch { /* ignore parse errors for Fabric.js JSON */ }
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

    const admin = createAdminClient();
    const { data: order } = await admin.from("orders").insert({
      user_id: userId,
      customer_email: userEmail,
      items: orderItems,
      total_amount: totalAmount,
      status: "pending",
      shipping_address: shippingAddress,
    }).select("id").single();

    orderId = order?.id ?? null;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}${orderId ? `&order_id=${orderId}` : ""}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    customer_email: userEmail || undefined,
    metadata: { order_id: orderId ?? "", user_id: userId ?? "" },
  });

  return NextResponse.json({ url: session.url });
}
