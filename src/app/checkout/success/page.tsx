"use client";

import Link from "next/link";
import { useEffect, useRef, Suspense } from "react";
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
  const sessionId = params.get("session_id");
  const confirmed = useRef(false);

  useEffect(() => {
    clearCart();

    // Mark the order as paid
    if (orderId && sessionId && !confirmed.current) {
      confirmed.current = true;
      fetch("/api/order/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, sessionId }),
      }).catch(() => {});
    }
  }, [clearCart, orderId, sessionId]);

  return (
    <div className="bg-white min-h-screen pt-[68px] flex flex-col items-center justify-center text-center px-6">
      <div className="w-12 h-12 bg-[#d2ff1f] flex items-center justify-center text-xl mb-8">✓</div>
      <p className="text-[10px] tracking-[0.4em] uppercase text-[#9ca3af] mb-3">Order confirmed</p>
      <h1 className="text-[clamp(28px,3vw,40px)] text-[#111111] mb-4">Thank you!</h1>
      <p className="text-sm text-[#6b7280] max-w-xs leading-relaxed mb-10">
        Your order has been placed. You&apos;ll receive a confirmation email shortly.
      </p>
      {orderId && (
        <p className="text-xs text-[#9ca3af] mb-10 font-mono">
          Order #{orderId.slice(0, 8).toUpperCase()}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/account/orders"
          className="bg-[#111111] text-white text-[10px] tracking-[0.22em] uppercase font-semibold px-8 py-3.5 hover:bg-[#2a2a2a] transition-colors"
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
