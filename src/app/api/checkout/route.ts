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

  const lineItems = items.map((item: { id: string; quantity: number }) => {
    const product = productMap.get(item.id);
    if (!product) throw new Error(`Product ${item.id} not found`);
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: product.description || undefined,
          images: product.image ? [product.image] : [],
        },
        unit_amount: product.price,
      },
      quantity: item.quantity,
    };
  });

  const totalAmount = items.reduce((sum: number, item: { id: string; quantity: number }) => {
    const product = productMap.get(item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  // Save a pending order before redirecting to Stripe
  let orderId: string | null = null;
  if (userId) {
    const orderItems = items.map((item: { id: string; quantity: number }) => {
      const product = productMap.get(item.id);
      return {
        id: item.id,
        name: product?.name ?? "",
        price: product?.price ?? 0,
        quantity: item.quantity,
        image: product?.image ?? "",
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
