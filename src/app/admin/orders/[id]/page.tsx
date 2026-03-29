import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";
import OrderStatusSelect from "../OrderStatusSelect";
import CopyPromptButton from "./CopyPromptButton";
import TrackingForm from "./TrackingForm";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  placed:     "bg-lime-100 text-lime-700",
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-600",
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customization?: {
    summary?: string;
    prompt?: string;
    details?: Record<string, unknown>;
  };
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const statusColor = STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600";
  const hasCustomItems = items.some(i => i.customization?.prompt || i.customization?.details);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 mb-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Orders
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          {order.tracking_id && (
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{order.tracking_id}</p>
          )}
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(order.created_at).toLocaleDateString("en-GB", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <OrderStatusSelect
          orderId={order.id}
          currentStatus={order.status}
          statusColor={statusColor}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: items + customization */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((item, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover flex-shrink-0 border border-gray-200 rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Qty: {item.quantity} · {formatPrice(item.price)} each
                          </p>
                          {item.customization?.summary && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded">
                              ✏ {item.customization.summary}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Custom order details */}
                  {item.customization?.details && (() => {
                    const d = item.customization!.details as Record<string, unknown>;
                    const fields = [
                      ["Product",  d.productType],
                      ["Shape",    d.shape],
                      ["Size",     d.size === "Custom" ? `Custom (${d.customWidth || "?"}×${d.customHeight || "?"}cm)` : d.size],
                      ["Wood",     d.wood],
                      ["Finish",   d.finish],
                      ["Colour",   d.colour],
                      ["Pattern",  d.patternStyle],
                      ["Occasion", d.occasion || "—"],
                      ["Engraving",d.engravingText || "None"],
                    ].filter(([, v]) => v);

                    return (
                      <div className="mt-4 border border-gray-100 rounded overflow-hidden">
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Customisation Details</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-gray-100">
                          {fields.map(([label, value]) => (
                            <div key={label as string} className="bg-white px-3 py-2">
                              <p className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">{label as string}</p>
                              <p className="text-xs font-medium text-gray-800 truncate">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                        {Array.isArray(d.addons) && (d.addons as string[]).length > 0 && (
                          <div className="px-3 py-2 border-t border-gray-100 bg-white">
                            <p className="text-[9px] uppercase tracking-wider text-gray-400 mb-1">Add-ons</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(d.addons as string[]).map((a) => (
                                <span key={a} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{a}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {typeof d.notes === "string" && d.notes.trim() && (
                          <div className="px-3 py-2 border-t border-gray-100 bg-white">
                            <p className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Customer Notes</p>
                            <p className="text-xs text-gray-700">{d.notes as string}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
            {/* Total */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Order Total</span>
              <span className="text-sm font-bold text-gray-900">
                {order.total_amount ? formatPrice(order.total_amount) : "—"}
              </span>
            </div>
          </div>

          {/* Workshop prompt (custom orders) */}
          {hasCustomItems && (
            <div className="bg-[#111111] rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Workshop Prompt
                </h2>
                <CopyPromptButton
                  prompt={items.map(i => i.customization?.prompt).filter(Boolean).join("\n\n---\n\n")}
                />
              </div>
              <div className="px-5 py-4 space-y-4">
                {items.filter(i => i.customization?.prompt).map((item, i) => (
                  <div key={i}>
                    {items.filter(it => it.customization?.prompt).length > 1 && (
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{item.name}</p>
                    )}
                    <pre className="text-[12px] text-white/70 leading-relaxed whitespace-pre-wrap font-mono">
                      {item.customization!.prompt}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: customer + shipping + tracking */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</h2>
            </div>
            <div className="px-4 py-4 space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.customer_name || "—"}</p>
              <p className="text-gray-500">{order.customer_email || "—"}</p>
            </div>
          </div>

          {/* Shipping */}
          {order.shipping_address && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipping Address</h2>
              </div>
              <div className="px-4 py-4 text-sm text-gray-700 space-y-0.5">
                {order.shipping_address.line1 && <p>{order.shipping_address.line1}</p>}
                {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                {order.shipping_address.city && (
                  <p>{order.shipping_address.city}{order.shipping_address.postal_code ? `, ${order.shipping_address.postal_code}` : ""}</p>
                )}
                {order.shipping_address.country && <p>{order.shipping_address.country}</p>}
              </div>
            </div>
          )}

          {/* Tracking fields */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking</h2>
            </div>
            <div className="px-4 py-4">
              {order.tracking_id && (
                <div className="mb-4 pb-3 border-b border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Tracking ID</p>
                  <p className="text-sm font-mono font-semibold text-gray-800">{order.tracking_id}</p>
                </div>
              )}
              <TrackingForm
                orderId={order.id}
                initialTrackingNumber={order.tracking_number}
                initialCarrier={order.carrier}
                initialEstimatedDelivery={order.estimated_delivery}
              />
            </div>
          </div>

          {/* Order meta */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Info</h2>
            </div>
            <div className="px-4 py-4 space-y-3 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
                  {order.status}
                </span>
              </div>
              {order.payment_method && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Payment</p>
                  <p className="text-xs text-gray-600 capitalize">{order.payment_method}</p>
                </div>
              )}
              {order.stripe_session_id && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Stripe Session</p>
                  <p className="font-mono text-xs text-gray-600 truncate">{order.stripe_session_id}</p>
                </div>
              )}
              {hasCustomItems && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Order Type</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded">
                    ✏ Custom Order
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
