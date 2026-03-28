"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type ShippingAddress = {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
};

type TrackingOrder = {
  id: string;
  tracking_id: string | null;
  customer_email: string;
  customer_name: string | null;
  status: string;
  order_status: string | null;
  items: OrderItem[];
  total_amount: number;
  created_at: string;
  estimated_delivery: string | null;
  tracking_number: string | null;
  carrier: string | null;
  shipping_address: ShippingAddress | null;
  delivery_address: ShippingAddress | null;
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
        {TIMELINE_STEPS.map((step, i) => {
          const state = getStepState(step.key, status);
          return (
            <div key={step.key} className="relative flex items-start gap-5 pb-6 last:pb-0">
              {/* Circle */}
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
              {/* Content */}
              <div className={`pt-0.5 ${i < TIMELINE_STEPS.length - 1 ? "" : ""}`}>
                <p
                  className={`text-sm font-medium ${
                    state === "upcoming" ? "text-[#9ca3af]" : "text-[#111111]"
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    state === "upcoming" ? "text-[#d1d5db]" : "text-[#6b7280]"
                  }`}
                >
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

export default function TrackOrderPage() {
  const [trackingId, setTrackingId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackingOrder | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    const { data, error: queryError } = await supabaseBrowser
      .from("orders")
      .select("*")
      .eq("tracking_id", trackingId.trim().toUpperCase())
      .eq("customer_email", email.trim().toLowerCase())
      .maybeSingle();

    setLoading(false);

    if (queryError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    if (!data) {
      setError("No order found with that tracking ID and email. Please check your details.");
      return;
    }

    setOrder(data as TrackingOrder);
  }

  const address = order?.delivery_address ?? order?.shipping_address;
  const items: OrderItem[] = Array.isArray(order?.items) ? (order.items as OrderItem[]) : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Dark header */}
      <div className="bg-[#111111] text-white pt-[68px] pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-3">Order Status</p>
          <h1 className="text-[clamp(28px,3vw,42px)] font-light">Track Your Order</h1>
          <p className="text-sm text-white/50 mt-3 max-w-sm mx-auto">
            Enter your tracking ID and email address to see real-time updates
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Form */}
        <form onSubmit={handleSubmit} className="border border-[#e8e8e5] p-6 mb-8">
          <h2 className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] mb-5">Enter Your Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">
                Tracking ID
              </label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="MYK-2026-XXXXX"
                required
                className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors font-mono tracking-wider"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6b7280] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-[#e8e8e5] px-3 py-3 text-sm text-[#111111] placeholder-[#d1d5db] focus:outline-none focus:border-[#111111] transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-[#ef4444] border border-[#fecaca] bg-[#fef2f2] px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold py-4 hover:bg-[#2a2a2a] disabled:opacity-50 transition-colors"
            >
              {loading ? "Searching…" : "Track Order"}
            </button>
          </div>
        </form>

        {/* Results */}
        {order && (
          <div className="space-y-6">
            {/* Status banner */}
            <div className="border border-[#e8e8e5] p-5 bg-[#f5f5f3]">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#9ca3af] mb-1">Tracking ID</p>
                  <p className="text-base font-mono font-semibold text-[#111111]">
                    {order.tracking_id ?? order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#9ca3af] mb-1">Status</p>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "shipped"
                        ? "bg-purple-100 text-purple-700"
                        : order.status === "processing"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {order.estimated_delivery && (
                <div className="mt-4 pt-4 border-t border-[#e8e8e5] flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-[#6b7280]">
                    Estimated delivery:{" "}
                    <span className="font-semibold text-[#111111]">
                      {new Date(order.estimated_delivery).toLocaleDateString("en-GB", {
                        weekday: "long", day: "numeric", month: "long",
                      })}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Carrier info */}
            {(order.carrier || order.tracking_number) && (
              <div className="border border-[#e8e8e5] p-5">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] mb-4">Shipment Details</p>
                <div className="grid grid-cols-2 gap-4">
                  {order.carrier && (
                    <div>
                      <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">Carrier</p>
                      <p className="text-sm font-medium text-[#111111]">{order.carrier}</p>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div>
                      <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">Tracking Number</p>
                      <p className="text-sm font-mono font-medium text-[#111111]">{order.tracking_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="border border-[#e8e8e5] p-6">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280] mb-6">Order Timeline</p>
              <Timeline status={order.status} />
            </div>

            {/* Items */}
            {items.length > 0 && (
              <div className="border border-[#e8e8e5]">
                <div className="px-5 py-3 border-b border-[#f3f4f6] bg-[#f5f5f3]">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b7280]">Items Ordered</p>
                </div>
                <div className="divide-y divide-[#f3f4f6]">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-3 p-4 items-center">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover flex-shrink-0 border border-[#e8e8e5]"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-[#f5f5f3] flex-shrink-0 border border-[#e8e8e5]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111111] truncate">{item.name}</p>
                        <p className="text-xs text-[#9ca3af] mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            <div className="text-center">
              <Link
                href="/"
                className="text-xs text-[#6b7280] hover:text-[#111111] border-b border-[#6b7280]/30 hover:border-[#111111] pb-px transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
