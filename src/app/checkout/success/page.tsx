"use client";

import Link from "next/link";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const { clearCart } = useCart();
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const confirmed = useRef(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  useEffect(() => {
    clearCart();

    if (orderId && !confirmed.current) {
      confirmed.current = true;

      // Confirm the order and get tracking ID in one call
      fetch("/api/order/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
        .then((r) => r.json())
        .then((data) => { if (data?.trackingId) setTrackingId(data.trackingId); })
        .catch(() => {});
    }
  }, [clearCart, orderId]);

  return (
    <div className="bg-white min-h-screen pt-[68px] flex flex-col items-center justify-center text-center px-6">
      <div className="w-14 h-14 bg-[#d2ff1f] flex items-center justify-center text-2xl mb-8">
        <svg className="w-7 h-7" fill="none" stroke="#111111" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-3">Order confirmed</p>
      <h1 className="text-[clamp(28px,3vw,40px)] text-[#111111] font-light mb-4">Thank you!</h1>
      <p className="text-sm text-[#6b7280] max-w-xs leading-relaxed mb-6">
        Your order has been placed. You&apos;ll receive a confirmation email shortly.
      </p>

      {/* Tracking ID — shown prominently */}
      {trackingId && (
        <div className="border border-[#e8e8e5] bg-[#f5f5f3] px-8 py-5 mb-8 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#9ca3af] mb-2">Your Tracking ID</p>
          <p className="text-xl font-mono font-semibold text-[#111111] tracking-widest">{trackingId}</p>
          <p className="text-[10px] text-[#9ca3af] mt-2">Save this to track your order</p>
        </div>
      )}

      {!trackingId && orderId && (
        <p className="text-xs text-[#9ca3af] mb-8 font-mono">
          Order #{orderId.slice(0, 8).toUpperCase()}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {trackingId && (
          <Link
            href={`/track?id=${trackingId}`}
            className="bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold px-8 py-3.5 hover:bg-[#2a2a2a] transition-colors"
          >
            Track Order
          </Link>
        )}
        <Link
          href="/account/orders"
          className={`text-[10px] tracking-[0.22em] uppercase font-semibold px-8 py-3.5 transition-colors ${
            trackingId
              ? "border border-[#e8e8e5] text-[#111111] hover:border-[#111111]"
              : "bg-[#111111] text-white hover:bg-[#2a2a2a]"
          }`}
        >
          View my orders
        </Link>
        <Link
          href="/"
          className="border border-[#e8e8e5] text-[#111111] text-[10px] tracking-[0.22em] uppercase font-semibold px-8 py-3.5 hover:border-[#111111] transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
