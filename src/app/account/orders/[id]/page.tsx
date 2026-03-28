import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerUser, createSupabaseServerClient } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customization?: {
    summary?: string;
    engraving?: string;
    font?: string;
    instructions?: string;
  };
};

type ShippingAddress = {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
};

type TimelineStep = {
  key: string;
  label: string;
  description: string;
};

const TIMELINE_STEPS: TimelineStep[] = [
  { key: "placed", label: "Order Placed", description: "We received your order" },
  { key: "confirmed", label: "Order Confirmed", description: "Payment confirmed" },
  { key: "processing", label: "Processing", description: "Being prepared by our team" },
  { key: "dispatched", label: "Dispatched", description: "On its way to you" },
  { key: "out_for_delivery", label: "Out for Delivery", description: "With your delivery driver" },
  { key: "delivered", label: "Delivered", description: "Successfully delivered" },
];

function getStepState(stepKey: string, status: string): "complete" | "active" | "upcoming" {
  const order = ["placed", "confirmed", "processing", "dispatched", "out_for_delivery", "delivered"];
  const statusMap: Record<string, string> = {
    pending: "confirmed",
    processing: "processing",
    shipped: "dispatched",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
  };
  const currentMapped = statusMap[status] ?? "confirmed";
  const currentIndex = order.indexOf(currentMapped);
  const stepIndex = order.indexOf(stepKey);

  if (stepKey === "placed") return "complete";
  if (stepIndex <= currentIndex) return "complete";
  if (stepIndex === currentIndex + 1) return "active";
  return "upcoming";
}

function Timeline({ status }: { status: string }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[#e8e8e5]" />
      <div className="space-y-0">
        {TIMELINE_STEPS.map((step) => {
          const state = getStepState(step.key, status);
          return (
            <div key={step.key} className="relative flex items-start gap-5 pb-6 last:pb-0">
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                  state === "complete"
                    ? "bg-[#111111] border-[#111111]"
                    : state === "active"
                    ? "bg-white border-[#111111]"
                    : "bg-white border-[#e8e8e5]"
                }`}
              >
                {state === "complete" ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : state === "active" ? (
                  <div className="w-2 h-2 bg-[#111111] rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-[#e8e8e5] rounded-full" />
                )}
              </div>
              <div className="pt-0.5">
                <p className={`text-sm font-medium ${state === "upcoming" ? "text-[#9ca3af]" : "text-[#111111]"}`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 ${state === "upcoming" ? "text-[#d1d5db]" : "text-[#6b7280]"}`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getServerUser();
  if (!user) redirect("/account/login?redirect=/account/orders");

  const supabase = await createSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const address: ShippingAddress | null = order.delivery_address ?? order.shipping_address ?? null;
  const orderRef = order.tracking_id ?? `#${order.id.slice(0, 8).toUpperCase()}`;

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
  };

  const statusColor = STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600";

  return (
    <div>
      {/* Back link */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#111111] transition-colors mb-6"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-1.5">Order</p>
          <h1 className="text-2xl font-light text-[#111111] font-mono">{orderRef}</h1>
          <p className="text-xs text-[#6b7280] mt-1">
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColor}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          {order.tracking_id && (
            <div className="mt-2">
              <Link
                href={`/track?id=${order.tracking_id}&email=${encodeURIComponent(order.customer_email ?? "")}`}
                className="inline-flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase font-semibold text-[#111111] border border-[#111111] px-3 py-1.5 hover:bg-[#111111] hover:text-white transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17l-5-5m0 0l5-5m-5 5h12m0 0l-5 5m5-5l-5-5" />
                </svg>
                Track Package
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Timeline */}
          <div className="border border-[#e8e8e5] p-6">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] mb-6">Order Status</p>
            <Timeline status={order.status} />
          </div>

          {/* Items */}
          <div className="border border-[#e8e8e5]">
            <div className="px-5 py-3 border-b border-[#f3f4f6] bg-[#f5f5f3]">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280]">
                Items ({items.length})
              </p>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {items.map((item, i) => (
                <div key={i} className="flex gap-4 p-4">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover flex-shrink-0 border border-[#e8e8e5]"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-[#f5f5f3] flex-shrink-0 border border-[#e8e8e5] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111111]">{item.name}</p>
                    {item.customization?.summary && (
                      <p className="text-xs text-[#6b7280] mt-0.5">{item.customization.summary}</p>
                    )}
                    {item.customization?.engraving && (
                      <p className="text-xs text-[#9ca3af] mt-0.5">
                        Engraving: <span className="font-medium">{item.customization.engraving}</span>
                      </p>
                    )}
                    <p className="text-xs text-[#9ca3af] mt-1">Qty: {item.quantity}</p>
                    <Link
                      href={`/products/${item.id}`}
                      className="inline-block mt-2 text-[10px] tracking-wider uppercase text-[#6b7280] border-b border-[#6b7280]/30 hover:text-[#111111] hover:border-[#111111] transition-colors pb-px"
                    >
                      Buy Again
                    </Link>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-[#111111]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-[10px] text-[#9ca3af] mt-0.5">
                      {formatPrice(item.price)} ea.
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Total */}
            <div className="px-5 py-4 bg-[#f5f5f3] border-t border-[#e8e8e5]">
              <div className="flex justify-between text-xs text-[#6b7280] mb-1.5">
                <span>Subtotal</span>
                <span>{formatPrice(order.total_amount ?? 0)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6b7280] mb-2">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#111111] pt-2 border-t border-[#e8e8e5]">
                <span>Total</span>
                <span>{formatPrice(order.total_amount ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Delivery info */}
          <div className="border border-[#e8e8e5] p-5">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] mb-4">Delivery</p>
            {order.estimated_delivery && (
              <div className="mb-3">
                <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-0.5">Estimated Delivery</p>
                <p className="text-sm font-medium text-[#111111]">
                  {new Date(order.estimated_delivery).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            )}
            {!order.estimated_delivery && (
              <p className="text-xs text-[#9ca3af]">5–7 business days</p>
            )}
            {order.carrier && (
              <div className="mt-3">
                <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-0.5">Carrier</p>
                <p className="text-sm text-[#111111]">{order.carrier}</p>
              </div>
            )}
            {order.tracking_number && (
              <div className="mt-3">
                <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-0.5">Tracking Number</p>
                <p className="text-sm font-mono text-[#111111]">{order.tracking_number}</p>
              </div>
            )}
          </div>

          {/* Delivery address */}
          {address && (
            <div className="border border-[#e8e8e5] p-5">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] mb-4">Delivery Address</p>
              <div className="text-sm text-[#374151] space-y-0.5">
                {address.name && <p className="font-medium">{address.name}</p>}
                {address.line1 && <p className="text-[#6b7280]">{address.line1}</p>}
                {address.line2 && <p className="text-[#6b7280]">{address.line2}</p>}
                {(address.city || address.postal_code) && (
                  <p className="text-[#6b7280]">
                    {address.city}
                    {address.postal_code ? `, ${address.postal_code}` : ""}
                  </p>
                )}
                {address.country && <p className="text-[#6b7280]">{address.country}</p>}
              </div>
            </div>
          )}

          {/* Payment method */}
          {order.payment_method && (
            <div className="border border-[#e8e8e5] p-5">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] mb-2">Payment</p>
              <p className="text-sm text-[#111111] capitalize">
                {order.payment_method === "card"
                  ? "Credit / Debit Card"
                  : order.payment_method === "paypal"
                  ? "PayPal"
                  : order.payment_method === "klarna"
                  ? "Klarna"
                  : order.payment_method}
              </p>
            </div>
          )}

          {/* Track package CTA */}
          {order.tracking_id && (
            <Link
              href={`/track?id=${order.tracking_id}&email=${encodeURIComponent(order.customer_email ?? "")}`}
              className="flex items-center justify-center gap-2 w-full border border-[#111111] text-[10px] tracking-[0.22em] uppercase font-semibold py-3.5 hover:bg-[#111111] hover:text-white transition-colors text-[#111111]"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Track Package
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
